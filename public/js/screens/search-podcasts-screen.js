import { InjectGlobalStylesheets } from "../utils.js"

export class SearchPodcastsScreen extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: "open" })
	}

	async connectedCallback() {
		this.shadowRoot.innerHTML = `
			<link href="./js/screens/search-podcasts-screen.css" rel="stylesheet" type="text/css">

			<div class="feature-coming-soon">
				<img src="../../assets/img/feature-coming-soon.png">
			</div>
		`
		InjectGlobalStylesheets(this)

	}

	disconnectedCallback() {

	}
}

customElements.define("search-podcasts-screen", SearchPodcastsScreen)
