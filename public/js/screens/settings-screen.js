import { InjectGlobalStylesheets } from "../utils.js"

export class SettingsScreen extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: "open" })
	}

	async connectedCallback() {
		this.shadowRoot.innerHTML = `
			<link href="./js/screens/settings-screen.css" rel="stylesheet" type="text/css">

		`
		InjectGlobalStylesheets(this)

	}

	disconnectedCallback() {

	}
}

customElements.define("settings-screen", SettingsScreen)
