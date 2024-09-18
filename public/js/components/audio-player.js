import { InjectGlobalStylesheets } from "../utils.js"

export class AudioPlayer extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: "open" })
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
	}

	SetSource(libraryUuid) {
		this.audioElement.src = "./play-song?library-uuid=" + libraryUuid
	}

	disconnectedCallback() {

	}
}

customElements.define("audio-player", AudioPlayer)
