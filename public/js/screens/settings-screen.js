import { InjectGlobalStylesheets } from "../utils.js"
import { LogOut } from "../index.js"

export const AppSettings = {
	autoCreateQueue: null,
}

function initializeAppSettings() {
	// Initialize default settings
	const appSettings = JSON.parse(localStorage.getItem("app-settings"))
	AppSettings.autoCreateQueue = appSettings?.["autoCreateQueue"] != null ? appSettings["autoCreateQueue"] : true
}

initializeAppSettings()

export class SettingsScreen extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: "open" })
	}

	async connectedCallback() {
		this.shadowRoot.innerHTML = `
			<link href="./js/screens/settings-screen.css" rel="stylesheet" type="text/css">

			<hr>
			<div class="grid-container">
				<div class="setting-row form-check form-switch">
					<label class="form-check-label">Playing a song automatically resets the queue</label>
					<input id="auto-create-queue-switch" class="form-check-input" type="checkbox" role="switch" ${AppSettings.autoCreateQueue ? "checked" : ""}>
				</div>

				<div class="setting-row">
					<label>Recent search history</label>
					<button id="btn-clear-search-history" class="btn btn-primary">Clear</button>
				</div>

				<div class="setting-row">
					<label>Log out of your Tuna Music account</label>
					<button id="btn-logout" class="btn btn-primary">Log out</button>
				</div>
			</div>

		`
		InjectGlobalStylesheets(this)

		this.shadowRoot.querySelector("#auto-create-queue-switch").onchange = (e) => {
			AppSettings.autoCreateQueue = e.target.checked
			this.SaveSettings()
		}

		this.shadowRoot.querySelector("#btn-logout").onclick = () => {
			LogOut()
		}

	}

	SaveSettings() {
		localStorage.setItem("app-settings", JSON.stringify(AppSettings))
	}

	disconnectedCallback() {
		this.shadowRoot.querySelector("#auto-create-queue-switch").onchange = null
		this.shadowRoot.querySelector("#btn-logout").onclick = null
	}
}

customElements.define("settings-screen", SettingsScreen)
