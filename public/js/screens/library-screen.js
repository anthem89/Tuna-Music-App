import { InjectGlobalStylesheets, secondsToTimestamp, RemoveAllChildren, CreateElementFromHTML } from "../utils.js"
import { DataTable } from "../components/data-table.js"
import { TrackData } from "../components/track-data.js"
import { SongTile } from "../components/song-tile.js"
import { AlertBanner, SessionExpired } from "../index.js"
import { SongActionsMenu } from "../components/song-actions-menu.js"

export class LibraryScreen extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: "open" })

		this.graphQlParams = {
			top: 25,
			skip: 0
		}
	}

	async connectedCallback() {
		this.shadowRoot.innerHTML = `
			<link href="./js/screens/library-screen.css" rel="stylesheet" type="text/css">

			<div id="library-table-wrapper"></div>
		`
		InjectGlobalStylesheets(this)

		this.dataTableWrapper = this.shadowRoot.querySelector("#library-table-wrapper")

		this.#loadLibraryData()

		this.dataTableWrapper.onclick = (e) => {
			this.#rowAction(e)
		}

		this.songActionsMenu = new SongActionsMenu()
		this.songActionsMenu.SetVisibleOptions({ removeFromPlaylist: false, downloadToLibrary: false })
	}

	async #loadLibraryData() {
		try {
			const res = await fetch("/user-library?top=" + this.graphQlParams.top + "&skip=" + this.graphQlParams.skip, { method: "GET" })
			if (res.redirected) {
				SessionExpired()
			} else if (res.status >= 400) {
				throw new Error(res.statusText)
			}
			const resJson = await res.json()

			const columnHeaders = ["Song", "Actions", "Album Name", "Duration"]
			const tableData = []

			if (Array.isArray(resJson)) {
				resJson.forEach((result, index) => {
					const actionsHtml = `<div class="action-link-container"><a class="link-underline action-link" name="btn-actions">Actions</a></div>`
					const trackData = new TrackData(result)
					const albumNameHtml = `<span class="clampTwoLines">${trackData.album}</span>`
					tableData.push([new SongTile(trackData), CreateElementFromHTML(actionsHtml), CreateElementFromHTML(albumNameHtml), secondsToTimestamp(trackData.duration)])
				})
			}

			const libraryTable = new DataTable(columnHeaders, tableData)
			libraryTable.classList.add("song-list-table")
			RemoveAllChildren(this.dataTableWrapper)
			this.dataTableWrapper.appendChild(libraryTable)
		} catch (e) {
			AlertBanner.Toggle(true, true, "Error loading library", 7000, AlertBanner.bannerColors.error)
		}
	}

	async #rowAction(e) {
		const targetRow = e.target.closest("tr")
		/** @type {SongTile} */
		const songTile = targetRow?.querySelector("song-tile")
		/** @type {HTMLAnchorElement} */
		const actionLink = e.target.closest(".action-link")
		if (actionLink != null) {
			if (actionLink.getAttribute("name") === "btn-actions") {
				const pos = actionLink.getBoundingClientRect()
				this.songActionsMenu.ForceShow(pos.x, pos.y + pos.height, pos.height, false, true, songTile)
			}
		} else if (songTile != null) {
			if (e.target.closest(".btn-open-mobile-context-menu") != null) {
				// User clicked on the "More options" button
				this.songActionsMenu.ForceShow(0, 0, 0, false, false, songTile)
			} else {
				songTile.PlaySong()
			}

		}
	}

	disconnectedCallback() {

	}
}

customElements.define("library-screen", LibraryScreen)









