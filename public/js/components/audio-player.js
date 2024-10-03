import { InjectGlobalStylesheets, isNullOrWhiteSpace } from "../utils.js"
import { TrackData } from "./data-models.js"
import { MediaTile } from "./media-tile.js"
import { CacheSongFromYouTube } from "../app-functions.js"

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


		this.audioElement.onended = () => {
			this.#updateMediaTiles()
		}

		this.audioElement.onplay = () => {
			this.#updateMediaTiles()
		}

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
				this.audioElement.src = sourceUrl
				this.albumImage.src = this.currentTrack.album_art || "../../assets/img/no-album-art.png"
				await this.audioElement.play()
				// #updateMediaTiles automatically gets called in the audioElement.play callback

				resolve()
			} catch (e) {
				this.#updateMediaTiles()
				AlertBanner.Toggle(true, true, "Error playing song", 7000, AlertBanner.bannerColors.error)
				reject(e)
			}
		})
	}

	disconnectedCallback() {
		this.albumImage.onerror = null
		this.audioElement.onended = null
		this.audioElement.onplay = null
	}
}

customElements.define("audio-player", AudioPlayer)
