import { InjectGlobalStylesheets } from "../utils.js"
import { LogOut } from "../index.js"

export const AppSettings = {
	autoResetQueue: null,
	preferHighQualityDownload: null,
}

function initializeAppSettings() {
	// Initialize default settings
	const appSettings = JSON.parse(localStorage.getItem("app-settings"))
	AppSettings.autoResetQueue = appSettings?.["autoResetQueue"] != null ? appSettings["autoResetQueue"] : true
	AppSettings.preferHighQualityDownload = appSettings?.["preferHighQualityDownload"] != null ? appSettings["preferHighQualityDownload"] : false

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
					<label class="form-check-label">Prefer highest quality download (uses more data)</label>
					<input id="high-quality-download-switch" class="form-check-input" type="checkbox" role="switch" ${AppSettings.preferHighQualityDownload ? "checked" : ""}>
				</div>

				<div class="setting-row form-check form-switch">
					<label class="form-check-label">Playing a song automatically resets the queue</label>
					<input id="auto-reset-queue-switch" class="form-check-input" type="checkbox" role="switch" ${AppSettings.autoResetQueue ? "checked" : ""}>
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

		this.shadowRoot.querySelector("#high-quality-download-switch").onchange = (e) => {
			AppSettings.preferHighQualityDownload = e.target.checked
			this.SaveSettings()
		}

		this.shadowRoot.querySelector("#auto-reset-queue-switch").onchange = (e) => {
			AppSettings.autoResetQueue = e.target.checked
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
		this.shadowRoot.querySelector("#high-quality-download-switch").onchange = null
		this.shadowRoot.querySelector("#auto-reset-queue-switch").onchange = null
		this.shadowRoot.querySelector("#btn-logout").onclick = null
	}
}

customElements.define("settings-screen", SettingsScreen)
