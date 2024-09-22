import { InjectGlobalStylesheets, secondsToTimestamp, RemoveAllChildren, CreateElementFromHTML } from "../utils.js"
import { DataTable } from "../components/data-table.js"
import { TrackData } from "../components/track-data.js"
import { SongTile } from "../components/song-tile.js"
import { AudioPlayer } from "../components/audio-player.js"

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

		const columnHeaders = ["Song", "Actions", "Album Name", "Duration"]
		const tableData = []
		this.resultsData = []

		if (Array.isArray(resJson)) {
			resJson.forEach((result, index) => {
				const actionsHtml = `<div class="action-link-container"><a class="link-underline btn-add">More</a></div>`
				const trackData = new TrackData(result)
				tableData.push([new SongTile(trackData), CreateElementFromHTML(actionsHtml), trackData.album, secondsToTimestamp(trackData.duration)])
			})
		}

		const libraryTable = new DataTable(columnHeaders, tableData)
		libraryTable.classList.add("song-list-table")
		RemoveAllChildren(this.dataTableWrapper)
		this.dataTableWrapper.appendChild(libraryTable)
	}

	async #rowAction(e) {
		/** @type {SongTile} */
		const targetRow = e.target.closest("tr")
		const songTile = targetRow?.querySelector("song-tile")
		if (songTile != null) {
			const libraryUuid = songTile.trackData.id
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









