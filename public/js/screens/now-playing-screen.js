import { InjectGlobalStylesheets } from "../utils.js"

export class NowPlayingScreen extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: "open" })
	}

	async connectedCallback() {
		this.shadowRoot.innerHTML = `
			<link href="./js/screens/home-screen.css" rel="stylesheet" type="text/css">

		`
		InjectGlobalStylesheets(this)

	}

	// disconnectedCallback() {}
}

customElements.define("now-playing-screen", NowPlayingScreen)
