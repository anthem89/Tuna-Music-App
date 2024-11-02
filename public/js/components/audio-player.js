import { InjectGlobalStylesheets, isNullOrWhiteSpace, CurrentUtcTimestamp } from "../utils.js"
import { TrackData } from "./data-models.js"
import { MediaTile } from "./media-tile.js"
import { CacheSongFromYouTube } from "../app-functions.js"
import { AlertBanner, isMobileUserAgent } from "../index.js"
import { SaveSessionState } from "../app-functions.js"

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
		this.currentQueueIndex = -1
		this.isPlaying = false
		this.isPaused = false

		this.consecutiveErrorCount = 0
		this.maximumConsecutiveErrorLimit = 5
	}

	connectedCallback() {
		this.shadowRoot.innerHTML = `
			<link href="./js/components/audio-player.css" rel="stylesheet" type="text/css">

			<div class="d-flex">
				<img id="album-image" src="">
				<div class="flex-grow-1">
					<div class="progress-slider-container">
						<input type="range" min="0" max="100" value="0" step="0.01" class="progress-slider">
					</div>
					<div class="d-flex justify-content-between align-items-center">
						<div class="d-flex flex-column">
							<span id="song-name" class="clampOneLine"></span>
							<span id="artist-name" class="clampOneLine"></span>
						</div>
						<button id="play-button">
							<i class="bi bi-play-fill ps-1 play-icon"></i>
							<i class="bi bi-pause-fill pause-icon"></i>
						</button>
					</div>
				</div>
			</div>
			<audio>
				<source src="" type="audio/mpeg">
			</audio>
		`
		InjectGlobalStylesheets(this)
		this.audioElement = this.shadowRoot.querySelector("audio")

		/** @type {HTMLInputElement} */
		this.progressSlider = this.shadowRoot.querySelector(".progress-slider")
		this.progressSlider.oninput = (e) => { this.#updateProgressSlider((e.target.value / this.progressSlider.max) * 100) }
		this.progressSlider.onmousedown = (e) => { this.#progressSliderDragState(true) }
		this.progressSlider.onmouseup = (e) => { this.#progressSliderDragState(false) }
		this.progressSlider.ontouchstart = (e) => { this.#progressSliderDragState(true) }
		this.progressSlider.ontouchend = (e) => {
			this.#progressSliderDragState(false)
			if (this.progressSliderIsDragging === true) {
				this.#updateProgressSlider((e.target.value / this.progressSlider.max) * 100)
			}
		}
		this.progressSliderIsDragging = false

		this.albumImage = this.shadowRoot.querySelector("img")
		this.albumImage.onerror = (e) => { e.target.src = "../../assets/img/no-album-art.png" }

		this.playButton = this.shadowRoot.querySelector("#play-button")
		this.playButton.onclick = () => { this.isPlaying === true ? this.audioElement.pause() : this.audioElement.play() }

		let lastSave = 0
		this.audioElement.onended = async () => {
			this.isPlaying = false
			this.isPaused = false
			this.playButton.classList.toggle("is-playing", false)
			if (this.trackQueue.length > 0) {
				await this.PlayNextSongInQueue()
			}
			this.#updateMediaTiles(false)

			if (isMobileUserAgent === true && document.visibilityState === "hidden") {
				SaveSessionState(false)
				lastSave = Date.now()
			}
		}

		this.audioElement.ontimeupdate = (e) => {
			// Sync the progress slider with the audio element
			if (this.progressSliderIsDragging === false && isNaN(e.target.currentTime) === false && isNaN(e.target.duration) === false) {
				this.#updateProgressSlider(e.target.currentTime / e.target.duration * 100)
			}

			// Since mobile browsers don't fire the unload event (allowing the opportunity to save session state) when the app is minimized, the session state must be periodically saved when the app is hidden
			if (isMobileUserAgent === true && document.visibilityState === "hidden") {
				const now = Date.now()
				if (now - lastSave > 5000) {
					SaveSessionState(false)
					lastSave = now
				}
			}
		}

		this.audioElement.onplay = () => {
			const srcIsEmpty = isNullOrWhiteSpace(this.audioElement.src)
			this.isPlaying = !srcIsEmpty
			this.isPaused = false
			this.playButton.classList.toggle("is-playing", !srcIsEmpty)
			this.#updateMediaTiles(!srcIsEmpty)
		}

		this.audioElement.onpause = () => {
			this.isPlaying = false
			this.isPaused = true
			this.playButton.classList.toggle("is-playing", false)
		}

		this.audioElement.onerror = (e) => {
			this.resetAudioElement()
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

	#progressSliderDragState(isDragging) {
		this.progressSliderIsDragging = isDragging
		this.progressSlider.classList.toggle("slider-is-dragging", isDragging)
		if (isDragging === false) {
			this.audioElement.currentTime = (this.progressSlider.value / 100) * this.audioElement.duration
		}
	}

	#updateProgressSlider(percent) {
		this.progressSlider.value = percent
		this.progressSlider.style.background = `linear-gradient(to right, var(--tunaPink) ${percent}%, transparent ${percent}%)`;
	}

	// Force all song tiles to test if their track id or video_id matches the currently playing track, and update accordingly
	#updateMediaTiles(updateRowStats) {
		const currentScreenElement = document.querySelector("#module-content-container section")?.firstElementChild?.shadowRoot
		if (currentScreenElement == null) { return }
		currentScreenElement.querySelectorAll(".media-tile").forEach(/** @param {MediaTile} mediaTile */(mediaTile) => {
			mediaTile.isCurrentlyPlaying()

			// Update play count and date last played stats for any table rows that are currently being displayed
			if (updateRowStats === true && mediaTile.tagName === "SONG-TILE") {
				const tableRow = mediaTile.closest("tr")
				if (tableRow != null) {
					if (this.currentTrack.id === mediaTile.trackData.id || this.currentTrack.video_id === mediaTile.trackData.video_id) {
						const dateLastPlayedCell = tableRow.querySelector("td[name='date_last_played'] span")
						if (dateLastPlayedCell != null) { dateLastPlayedCell.textContent = this.currentTrack.date_last_played ? dayjs(this.currentTrack.date_last_played + "Z").fromNow() : "N/A" }
						const numberOfPlaysCell = tableRow.querySelector("td[name='number_of_plays']")
						if (numberOfPlaysCell != null) { numberOfPlaysCell.textContent = this.currentTrack.number_of_plays || "0" }
					}
				}
			}
		})
	}

	/** @param {TrackData} trackData */
	async LoadSongInAudioPlayer(trackData) {
		return new Promise(async (resolve, reject) => {
			try {
				let sourceUrl
				if (isNullOrWhiteSpace(trackData.id)) {
					if (isNullOrWhiteSpace(trackData.video_id)) { throw new Error("Cannot play song without either a library id or video id") }
					// Create a blob url for the temporary song download
					sourceUrl = await CacheSongFromYouTube(trackData.video_id)
					if (sourceUrl == null) { throw new Error("error downloading song from YouTube") }
				} else {
					// The url to play the song directly fron the Tuna library
					sourceUrl = "./play-song?library-uuid=" + trackData.id
				}
				const albumArt = trackData.album_art || "../../assets/img/no-album-art.png"

				navigator.mediaSession.metadata = new MediaMetadata({
					title: trackData.title,
					artist: trackData.artist,
					album: trackData.album,
					artwork: [{ src: albumArt }]
				})

				this.audioElement.src = sourceUrl
				this.albumImage.src = albumArt
				this.shadowRoot.querySelector("#song-name").textContent = trackData.title || "Untitled Track"
				this.shadowRoot.querySelector("#artist-name").textContent = trackData.artist || "Unknown Artist"
				document.querySelector("footer").classList.toggle("hidden", false)
				resolve()
			} catch (e) {
				console.error(e)
				reject(e)
			}
		})
	}

	/** @param {TrackData} trackData */
	PlaySong(trackData, playNextOnFailure = false) {
		return new Promise(async (resolve) => {
			try {
				this.currentQueueIndex = this.GetTrackIndexInQueue(trackData)
				if (this.currentQueueIndex === -1) { this.currentQueueIndex = 0 }

				this.currentTrack = this.trackQueue[this.currentQueueIndex]

				await this.LoadSongInAudioPlayer(this.currentTrack)

				if (this.audioElement.src.startsWith("blob:") === false) {
					// The incremental number of plays statistic will only apply if the song is played from the tuna library
					this.currentTrack.date_last_played = CurrentUtcTimestamp()
					this.currentTrack.number_of_plays += 1
				}

				await this.audioElement.play()

				this.consecutiveErrorCount = 0
				resolve(true)
			} catch (e) {
				this.consecutiveErrorCount++
				AlertBanner.Toggle(true, true, "Error playing song", 7000, AlertBanner.bannerColors.error)
				if (playNextOnFailure === true && this.trackQueue.length > 1 && this.consecutiveErrorCount < this.maximumConsecutiveErrorLimit) {
					this.PlayNextSongInQueue()
				} else {
					this.resetAudioElement()
				}
				console.error(e)
				resolve(false)
			}
		})
	}

	async PlayNextSongInQueue() {
		if (this.currentQueueIndex === this.trackQueue.length - 1) {
			this.currentQueueIndex = 0 // Loop back to start if at end
		} else {
			this.currentQueueIndex ++
		}
		await this.PlaySong(this.trackQueue[this.currentQueueIndex], true)
	}

	async PlayPreviousSongInQueue() {
		if (this.currentQueueIndex > 0) {
			this.currentQueueIndex --
		} else {
			this.currentQueueIndex = this.trackQueue.length - 1 // Loop to end if at start
		}
		await this.PlaySong(this.trackQueue[this.currentQueueIndex], false)
	}

	/** @param {TrackData[]} */
	UpdateQueue(trackDataArray, playlistId) {
		this.trackQueue = Array.isArray(trackDataArray) ? [...trackDataArray] : []
		this.currentPlaylistId = playlistId
		this.currentQueueIndex = 0
		// Reset the audio element
		if (this.trackQueue.length === 0) {
			this.resetAudioElement()
			this.currentQueueIndex = -1
		}
	}

	/** @param {TrackData} targetTrackData */
	async RemoveTrackFromQueue(targetTrackData, autoPlayNextSong = true) {
		return new Promise(async (resolve, reject) => {
			try {
				const targetIndex = this.GetTrackIndexInQueue(targetTrackData)
				// If the track is not found, do nothing
				if (targetIndex === -1) {
					resolve(false)
					return
				}
				if (this.trackQueue.length > 1) {
					// If the song that is currently playing gets removed, skip to the next song
					if (targetIndex === this.currentQueueIndex && autoPlayNextSong === true) {
						const wasPlaying = this.isPlaying
						const wasPaused = this.isPaused
						await this.PlayNextSongInQueue()
						if (wasPlaying === false || wasPaused === true) {
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
					this.currentQueueIndex = -1
				}
				resolve(true)
			} catch (e) {
				console.error(e)
				reject(e)
			}
		})
	}

	/**
	 * @param {TrackData} trackData
	 * @param {String} position Options are "start" or "end"
	 **/
	AddTrackToQueue(trackData, position = "end") {
		if (this.GetTrackIndexInQueue(trackData) === -1) {
			const clonedTrack = new TrackData({ ...trackData })
			if (position === "start") {
				this.trackQueue.splice(0, 0, clonedTrack)
				this.currentQueueIndex++
			} else {
				this.trackQueue.push(clonedTrack)
			}
			if (this.trackQueue.length === 1) {
				this.LoadSongInAudioPlayer(clonedTrack)
			}
			return true
		} else {
			return false
		}
	}

	/** @param {TrackData} trackData */
	SetTrackToPlayNextInQueue(trackData) {
		return new Promise(async (resolve) => {
			try {
				const targetTrackIndex = this.GetTrackIndexInQueue(trackData)
				if (targetTrackIndex > -1) {
					await this.RemoveTrackFromQueue(trackData, false)
				}
				this.trackQueue.splice(this.currentQueueIndex + 1, 0, new TrackData({ ...trackData }))
				resolve(true)
			} catch (e) {
				console.error(e)
				resolve(false)
			}
		})
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

	resetAudioElement() {
		this.isPlaying = false
		this.isPaused = false
		this.playButton.classList.toggle("is-playing", false)
		this.albumImage.src = "../../assets/img/no-album-art.png"
		this.shadowRoot.querySelector("#song-name").textContent = ""
		this.shadowRoot.querySelector("#artist-name").textContent = ""
		this.#updateProgressSlider(0)
		this.audioElement.removeAttribute("src")
		this.audioElement.load()
		document.querySelector("footer").classList.toggle("hidden", true)
		this.#updateMediaTiles(false)
	}

	disconnectedCallback() {
		this.albumImage.onerror = null
		this.audioElement.onended = null
		this.audioElement.onplay = null
		this.progressSlider.oninput = null
		this.progressSlider.ontouchstart = null
		this.progressSlider.ontouchend = null
		this.progressSlider.onmousedown = null
		this.progressSlider.onmouseup = null
		this.playButton.onclick = null
	}
}

customElements.define("audio-player", AudioPlayer)
