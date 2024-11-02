import { InjectGlobalStylesheets } from "../utils.js"

export class HomeScreen extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: "open" })
	}

	async connectedCallback() {
		const cookies = document.cookie.split("; ")
		const cookie = cookies.find(cookie => cookie.startsWith("currentUser="))
		const userDisplayName = cookie ? cookie.split("=")[1] : "Unknown"

		this.shadowRoot.innerHTML = `
			<link href="./js/screens/home-screen.css" rel="stylesheet" type="text/css">

			<h2 id="greeting">${this.#greetUser(userDisplayName)}</h2>

		`
		InjectGlobalStylesheets(this)

	}

	#greetUser(username) {
		const currentHour = dayjs().hour()
		let greeting
		if (currentHour < 12) {
			greeting = "Good morning,"
		} else if (currentHour < 18) {
			greeting = "Good afternoon,"
		} else {
			greeting = "Good evening,"
		}
		return greeting + " " + username
	}

	// disconnectedCallback() {}
}

customElements.define("home-screen", HomeScreen)
