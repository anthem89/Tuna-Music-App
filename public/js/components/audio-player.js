import { InjectGlobalStylesheets, isNullOrWhiteSpace, CurrentUtcTimestamp } from "../utils.js"
import { TrackData } from "./data-models.js"
import { MediaTile } from "./media-tile.js"
import { CacheSongFromYouTube } from "../app-functions.js"
import { AlertBanner } from "../index.js"

export class AudioPlayer extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: "open" })
		/** @type {TrackData} */
		this.currentTrack = null
		/** @type {String} */
		this.currentPlaylistId = null
		/** @type {HTMLAudioElement} */
		this.audioElement = null

		/** @type {TrackData[]} */
		this.trackQueue = []
		this.currentQueueIndex = 0
		this.isPlaying = false
		this.isPaused = false

		this.consecutiveErrorCount = 0
		this.maximumConsecutiveErrorLimit = 5
	}

	connectedCallback() {
		this.shadowRoot.innerHTML = `
			<link href="./js/components/audio-player.css" rel="stylesheet" type="text/css">

			<div id="element-wrapper">
				<img id="album-image" src="">
				<audio controls>
					<source src="" type="audio/mpeg">
				</audio>
			</div>

		`
		InjectGlobalStylesheets(this)
		this.audioElement = this.shadowRoot.querySelector("audio")

		this.albumImage = this.shadowRoot.querySelector("img")
		this.albumImage.onerror = (e) => { e.target.src = "../../assets/img/no-album-art.png" }


		this.audioElement.onended = async () => {
			this.isPlaying = false
			this.isPaused = false
			if (this.trackQueue.length > 0) {
				await this.PlayNextSongInQueue()
			}
			this.#updateMediaTiles(false)
		}

		this.audioElement.onplay = () => {
			this.isPlaying = true
			this.isPaused = false
			this.#updateMediaTiles(true)
		}

		this.audioElement.onpause = () => {
			this.isPlaying = false
			this.isPaused = true
		}

		// Set up media session actions
		navigator.mediaSession.setActionHandler('play', () => {
			this.audioElement.play()
		})
		navigator.mediaSession.setActionHandler('pause', () => {
			this.audioElement.pause()
		})
		navigator.mediaSession.setActionHandler('nexttrack', () => {
			this.PlayNextSongInQueue()
		})
		navigator.mediaSession.setActionHandler('previoustrack', () => {
			this.PlayPreviousSongInQueue()
		})

	}

	// Force all song tiles to test if their track id or video_id matches the currently playing track, and update accordingly
	#updateMediaTiles(updateRowStats) {
		const currentScreenElement = document.querySelector("#module-content-container section").firstElementChild.shadowRoot
		currentScreenElement.querySelectorAll(".media-tile").forEach(/** @param {MediaTile} mediaTile */(mediaTile) => {
			mediaTile.isCurrentlyPlaying()

			// Update play count and date last played stats for any table rows that are currently being displayed
			if (updateRowStats === true && mediaTile.tagName === "SONG-TILE") {
				const tableRow = mediaTile.closest("tr")
				if (tableRow != null) {
					tableRow.querySelector("td[name='date_last_played'] span").textContent = mediaTile.trackData.date_last_played ? dayjs(mediaTile.trackData.date_last_played + "Z").fromNow() : "N/A"
					if (this.currentTrack.id === mediaTile.trackData.id || this.currentTrack.video_id === mediaTile.trackData.video_id) {
						tableRow.querySelector("td[name='number_of_plays']").textContent = this.currentTrack.number_of_plays || "0"
					}
				}
			}
		})
	}

	/** @param {TrackData} trackData */
	PlaySong(trackData, playNextOnFailure = false) {
		return new Promise(async (resolve) => {
			try {
				this.currentQueueIndex = this.GetTrackIndexInQueue(trackData)
				this.currentTrack = this.trackQueue[this.currentQueueIndex]

				if (this.currentQueueIndex == null) { this.currentQueueIndex = 0 }
				let sourceUrl
				if (isNullOrWhiteSpace(this.currentTrack.id)) {
					if (isNullOrWhiteSpace(this.currentTrack.video_id)) { throw new Error("Cannot play song without either a library id or video id") }
					// Play the song directly from YouTube
					sourceUrl = await CacheSongFromYouTube(this.currentTrack.video_id)
					if (sourceUrl == null) { throw new Error("error downloading song from YouTube") }
				} else {
					// Play the song from the Tuna library
					sourceUrl = "./play-song?library-uuid=" + this.currentTrack.id

					// The incremental number of plays statistic will only apply if the song is played from the tuna library
					this.currentTrack.date_last_played = CurrentUtcTimestamp()
					this.currentTrack.number_of_plays += 1
				}

				this.audioElement.src = sourceUrl
				this.albumImage.src = this.currentTrack.album_art || "../../assets/img/no-album-art.png"
				await this.audioElement.play()

				navigator.mediaSession.metadata = new MediaMetadata({
					title: this.currentTrack.title,
					artist: this.currentTrack.artist,
					album: this.currentTrack.album,
					artwork: [{ src: this.currentTrack.album_art }]
				})

				this.consecutiveErrorCount = 0

				resolve(true)
			} catch (e) {
				this.consecutiveErrorCount++
				AlertBanner.Toggle(true, true, "Error playing song", 7000, AlertBanner.bannerColors.error)
				if (playNextOnFailure === true && this.trackQueue.length > 1 && this.consecutiveErrorCount < this.maximumConsecutiveErrorLimit) {
					this.PlayNextSongInQueue()
				} else {
					this.#resetAudioElement()
					this.#updateMediaTiles(false)
				}
				resolve(false)
			}
		})
	}

	async PlayNextSongInQueue() {
		this.currentQueueIndex = (this.currentQueueIndex + 1) % this.trackQueue.length  // Loop back to start if at end
		await this.PlaySong(this.trackQueue[this.currentQueueIndex], true)
	}

	async PlayPreviousSongInQueue() {
		this.currentQueueIndex = (this.currentQueueIndex - 1 + this.trackQueue.length) % this.trackQueue.length  // Loop to end if at start
		await this.PlaySong(this.trackQueue[this.currentQueueIndex], false)
	}

	/** @param {TrackData[]} */
	UpdateQueue(trackDataArray, playlistId) {
		this.trackQueue = Array.isArray(trackDataArray) ? [...trackDataArray] : []
		this.currentPlaylistId = playlistId
		this.currentQueueIndex = 0
		// Reset the audio element
		if (this.trackQueue.length === 0) {
			this.#resetAudioElement()
		}
	}

	/** @param {TrackData} targetTrackData */
	async RemoveTrackFromQueue(targetTrackData) {
		const targetIndex = this.GetTrackIndexInQueue(targetTrackData)
		// If the track is not found, do nothing
		if (targetIndex === -1) { return }
		if (this.trackQueue.length > 1) {
			// If the song that is currently playing gets removed, skip to the next song
			if (targetIndex === this.currentQueueIndex) {
				const wasPlaying = this.isPlaying
				await this.PlayNextSongInQueue()
				if (wasPlaying === false) {
					this.audioElement.pause()
				}
			}
			// Remove the target track from the queue and adjust the current queue index accordingly
			this.trackQueue.splice(targetIndex, 1)
			if (targetIndex < this.currentQueueIndex && this.currentQueueIndex > 0) {
				this.currentQueueIndex -= 1
			}
		} else {
			this.UpdateQueue([], this.currentPlaylistId)
		}
	}

	/** @param {TrackData} trackData */
	AddTrackToQueue(trackData) {
		if (this.GetTrackIndexInQueue(trackData) === -1) {
			this.trackQueue.push(new TrackData({ ...trackData }))
			return true
		} else {
			return false
		}
	}

	/** @param {TrackData} trackData */
	SetTrackToPlayNextInQueue(trackData) {
		const targetTrackIndex = this.GetTrackIndexInQueue(trackData)
		if (targetTrackIndex === -1) {
			this.AddTrackToQueue(trackData)
		} else {
			this.RemoveTrackFromQueue(trackData)
			this.trackQueue.splice(this.currentQueueIndex + 1, 0, new TrackData({...trackData}))
		}
	}

	ClearQueue() {
		this.UpdateQueue([], null)
	}

	/** @param {TrackData} targetTrackData */
	GetTrackIndexInQueue(targetTrackData) {
		return this.trackQueue.findIndex((trackData) => {
			if (targetTrackData.id != null) {
				return targetTrackData.id === trackData.id
			} else {
				return targetTrackData.video_id === trackData.video_id
			}
		})
	}

	#resetAudioElement() {
		this.isPlaying = false
		this.isPaused = false
		this.audioElement.src = ""
		this.audioElement.load()
	}

	disconnectedCallback() {
		this.albumImage.onerror = null
		this.audioElement.onended = null
		this.audioElement.onplay = null
	}
}

customElements.define("audio-player", AudioPlayer)
