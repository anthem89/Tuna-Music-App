import { InjectGlobalStylesheets, isNullOrWhiteSpace } from "../utils.js"
import { TrackData } from "./data-models.js"
import { MediaTile } from "./media-tile.js"
import { CacheSongFromYouTube } from "../app-functions.js"
import { currentScreenKey, AlertBanner } from "../index.js"

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
		this.maxQueueLength = 20
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
			if (this.trackQueue.length > 0) {
				await this.PlayNextSongInQueue()
			}
			this.#updateMediaTiles()
		}

		this.audioElement.onplay = () => {
			this.#updateMediaTiles()
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
	PlaySong(trackData, parentPlaylistId) {
		return new Promise(async (resolve, reject) => {
			try {
				this.currentPlaylistId = parentPlaylistId
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
				this.currentQueueIndex = this.trackQueue.findIndex((trackData) => {
					if (this.currentTrack.id != null) {
						return trackData.id === this.currentTrack.id
					} else {
						return trackData.video_id === this.currentTrack.video_id
					}
				})
				if(this.currentQueueIndex  < 0){ this.currentQueueIndex = 0}

				this.audioElement.src = sourceUrl
				this.albumImage.src = this.currentTrack.album_art || "../../assets/img/no-album-art.png"
				await this.audioElement.play()

				navigator.mediaSession.metadata = new MediaMetadata({
					title: trackData.title,
					artist: trackData.artist,
					album: trackData.album,
					artwork: [{ src: trackData.album_art }]
				})

				// #updateMediaTiles automatically gets called in the audioElement.play callback
				resolve()
			} catch (e) {
				this.currentTrack = null
				this.#updateMediaTiles()
				AlertBanner.Toggle(true, true, "Error playing song", 7000, AlertBanner.bannerColors.error)
				reject(e)
			}
		})
	}

	async PlayNextSongInQueue() {
		this.currentQueueIndex = (this.currentQueueIndex + 1) % this.trackQueue.length  // Loop back to start if at end
		await this.PlaySong(this.trackQueue[this.currentQueueIndex], this.currentPlaylistId)
	}

	async PlayPreviousSongInQueue() {
		this.currentQueueIndex = (this.currentQueueIndex - 1 + this.trackQueue.length) % this.trackQueue.length  // Loop to end if at start
		await this.PlaySong(this.trackQueue[this.currentQueueIndex], this.currentPlaylistId)
	}

	/** @param {TrackData[]} */
	UpdateQueue(trackDataArray) {
		this.trackQueue = trackDataArray
		if(this.trackQueue.length <= 0){ this.currentQueueIndex = 0 }
		if (currentScreenKey === "nowPlaying") {
			// TODO
			// TODO
			// TODO
			// TODO
		}
	}

	ClearQueue() {
		this.UpdateQueue([])
	}

	disconnectedCallback() {
		this.albumImage.onerror = null
		this.audioElement.onended = null
		this.audioElement.onplay = null
	}
}

customElements.define("audio-player", AudioPlayer)
