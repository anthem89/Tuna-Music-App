import { InjectGlobalStylesheets, secondsToTimestamp } from "../utils.js"
import { DataTable, DataTableHeader } from "../components/data-table.js"
import { TrackData } from "../components/track-data.js"

export class LibraryScreen extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: "open" })
	}

	async connectedCallback() {
		this.shadowRoot.innerHTML = `
			<link href="./js/screens/library-screen.css" rel="stylesheet" type="text/css">

			<div id="library-table-wrapper">

			</div>
		`
		InjectGlobalStylesheets(this)

		this.dataTableWrapper = this.shadowRoot.querySelector("#library-table-wrapper")

		this.#loadLibraryData()

		this.dataTableWrapper.onclick = (e) => {
			this.#rowAction(e)
		}

	}

	async #loadLibraryData() {
		const res = await fetch("/user-library", { method: "GET" })
		const resJson = await res.json()

		const columnHeaders = ["Actions", "Album Artwork", "Artist", "Song Title", "Album Name", "Duration"].map((header) => new DataTableHeader({ name: header, resizeable: false, sortable: false }))

		const tableData = []
		this.resultsData = []

		if (Array.isArray(resJson)) {
			resJson.forEach((result, index) => {
				const actionsHtml = `<div data-library-uuid="${result["id"]}" data-index="${index}"><a class="link-underline btn-play">Play</a></div>`
				const albumArt = `<img class="album-artwork" src="${result["album_art"]}">`
				const artistName = result["artist"]
				const songTitle = result["title"]
				const albumName = result["album"]
				const duration = result["duration"]


				tableData.push([actionsHtml, albumArt, artistName, songTitle, albumName, secondsToTimestamp(duration)])
			})
		}

		const libraryTable = new DataTable(columnHeaders, tableData)
		this.dataTableWrapper.innerHTML = ""
		this.dataTableWrapper.appendChild(libraryTable)
	}

	async #rowAction(e) {
		const target = e.target.closest("a")
		const targetRow = target.parentElement
		let libraryUuid
		if (target != null && target.classList.contains("btn-play")) {
			libraryUuid = targetRow.dataset["libraryUuid"]
			/** @type {AudioPlayer} */
			const audioPlayer = this.shadowRoot.ownerDocument.querySelector("audio-player")
			audioPlayer.SetSource(libraryUuid)
			audioPlayer.audioElement.play()
		}
	}

	disconnectedCallback() {

	}
}

customElements.define("library-screen", LibraryScreen)









