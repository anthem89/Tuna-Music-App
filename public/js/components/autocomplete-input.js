import { InjectGlobalStylesheets, RemoveAllChildren } from "../utils.js"

export class AutocompleteInput extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: "open" })
	}

	connectedCallback() {
		this.shadowRoot.innerHTML = `
			<link href="./js/components/autocomplete-input.css" rel="stylesheet" type="text/css">

			<div class="autocomplete-container">
				<input type="text" class="autocomplete-input" placeholder="Search..." maxlength="50" spellcheck="false" autocomplete="off">
				<div tabindex="-1" class="autocomplete-suggestions"></div>
			</div>
		`
		InjectGlobalStylesheets(this)

		this.inputElement = this.shadowRoot.querySelector(".autocomplete-input")
		this.suggestionsElement = this.shadowRoot.querySelector(".autocomplete-suggestions")
		this.inputElement.oninput = () => { this.handleInput() }
		this.suggestionsElement.onclick = (e) => { this.handleSuggestionClick(e) }
		this.InputCallback = null
		this.inputElement.onblur = (e) => {
			if (e.relatedTarget?.closest(".autocomplete-suggestions") == null) {
				this.closeSuggestionDropdown()
			}
		}
	}

	async handleInput() {
		const query = this.inputElement.value
		const suggestions = await this.InputCallback(query)
		this.renderSuggestions(suggestions)
	}

	handleSuggestionClick(event) {
		if (event.target.classList.contains("autocomplete-suggestion")) {
			this.inputElement.value = event.target.innerText
			RemoveAllChildren(this.suggestionsElement)
		}
	}

	renderSuggestions(suggestions) {
		this.suggestionsElement.innerHTML = DOMPurify.sanitize(suggestions.map(item => `<div class="autocomplete-suggestion">${item}</div>`).join(""))
	}

	closeSuggestionDropdown() {
		RemoveAllChildren(this.suggestionsElement)
	}

	disconnectedCallback() {
		this.inputElement.oninput = null
		this.suggestionsElement.onclick = null
		this.inputElement.onblur = null
	}
}

customElements.define("autocomplete-input", AutocompleteInput)
