import { InjectGlobalStylesheets, isNullOrWhiteSpace } from "../utils.js"
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
			this.#updateMediaTiles()
		}

		this.audioElement.onplay = () => {
			this.isPlaying = true
			this.isPaused = false
			this.#updateMediaTiles()
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
	#updateMediaTiles() {
		const currentScreenElement = document.querySelector("#module-content-container section").firstElementChild.shadowRoot
		currentScreenElement.querySelectorAll(".media-tile").forEach(/** @param {MediaTile} mediaTile */(mediaTile) => {
			mediaTile.isCurrentlyPlaying()
		})
	}

	/** @param {TrackData} trackData */
	PlaySong(trackData, playNextOnFailure = false) {
		return new Promise(async (resolve) => {
			try {
				this.currentQueueIndex = this.#getTrackIndexInQueue(trackData)
				if (this.currentQueueIndex == null) { this.currentQueueIndex = 0 }
				let sourceUrl
				if (isNullOrWhiteSpace(trackData.id)) {
					if (isNullOrWhiteSpace(trackData.video_id)) { throw new Error("Cannot play song without either a library id or video id") }
					// Play the song directly from YouTube
					sourceUrl = await CacheSongFromYouTube(trackData.video_id)
					if (sourceUrl == null) { throw new Error("error downloading song from YouTube") }
				} else {
					// Play the song from the Tuna library
					sourceUrl = "./play-song?library-uuid=" + trackData.id
				}

				this.currentTrack = new TrackData({ ...trackData })
				this.audioElement.src = sourceUrl
				this.albumImage.src = this.currentTrack.album_art || "../../assets/img/no-album-art.png"
				await this.audioElement.play()

				navigator.mediaSession.metadata = new MediaMetadata({
					title: trackData.title,
					artist: trackData.artist,
					album: trackData.album,
					artwork: [{ src: trackData.album_art }]
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
					this.#updateMediaTiles()
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
		this.trackQueue = trackDataArray
		this.currentPlaylistId = playlistId
		this.currentQueueIndex = 0
		// Reset the audio element
		if (this.trackQueue.length === 0) {
			this.#resetAudioElement()
		}
	}

	/** @param {TrackData} targetTrackData */
	async RemoveTrackFromQueue(targetTrackData) {
		const targetIndex = this.#getTrackIndexInQueue(targetTrackData)
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

	ClearQueue() {
		this.UpdateQueue([], null)
	}

	/** @param {TrackData} targetTrackData */
	#getTrackIndexInQueue(targetTrackData) {
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
