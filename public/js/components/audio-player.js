import { InjectGlobalStylesheets, isNullOrWhiteSpace } from "../utils.js"
import { TrackData } from "./data-models.js"
import { SongTile } from "./song-tile.js"

export class AudioPlayer extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: "open" })
		/** @type {TrackData} */
		this.currentTrack
		this.audioElement = null
	}

	connectedCallback() {
		this.shadowRoot.innerHTML = `
			<link href="./js/components/audio-player.css" rel="stylesheet" type="text/css">

			<audio controls>
				<source src="" type="audio/mpeg">
			</audio>
		`
		InjectGlobalStylesheets(this)
		this.audioElement = this.shadowRoot.querySelector("audio")

		this.audioElement.onended = () => {
			this.#updateSongTiles()
		}

		this.audioElement.onplay = () => {
			this.#updateSongTiles()
		}
	}

	// Force all song tiles to test if their track id or video_id matches the currently playing track, and update accordingly
	#updateSongTiles() {
		const currentScreenElement = document.querySelector("#module-content-container section").firstElementChild.shadowRoot
		currentScreenElement.querySelectorAll("song-tile").forEach(/** @param {SongTile} songTile */(songTile) => {
			songTile.isCurrentlyPlaying()
		})
	}

	Play(sourceUrl, trackData) {
		return new Promise(async (resolve, reject) => {
			try {
				if (isNullOrWhiteSpace(sourceUrl) === false) {
					this.currentTrack = new TrackData({ ...trackData })
					this.audioElement.src = sourceUrl
					await this.audioElement.play()
				}
				resolve()
			} catch (e) {
				this.#updateSongTiles()
				reject(e)
			}
		})
	}

	disconnectedCallback() {

	}
}

customElements.define("audio-player", AudioPlayer)
