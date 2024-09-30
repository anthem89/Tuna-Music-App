import { InjectGlobalStylesheets, RemoveAllChildren } from "../utils.js"
import { SongTile } from "../components/song-tile.js"
import { AlertBanner } from "../index.js"
import { SongActionsMenu } from "../components/song-actions-menu.js"
import { VirtualizedInfiniteScroll } from "../components/infinite-scroll-list.js"

export class LibraryScreen extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: "open" })
	}

	async connectedCallback() {
		this.shadowRoot.innerHTML = `
			<link href="./js/screens/library-screen.css" rel="stylesheet" type="text/css">

			<div id="library-table-wrapper"></div>
		`
		InjectGlobalStylesheets(this)

		this.dataTableWrapper = this.shadowRoot.querySelector("#library-table-wrapper")
		this.dataTableWrapper.onclick = (e) => {
			this.#rowAction(e)
		}

		this.#loadLibraryData()

		this.songActionsMenu = new SongActionsMenu()
		this.songActionsMenu.SetVisibleOptions({ removeFromPlaylist: false, downloadToLibrary: false })
	}

	async #loadLibraryData() {
		try {
			const libraryTable = new VirtualizedInfiniteScroll("/user-library")
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
		this.dataTableWrapper.onclick = null
	}
}

customElements.define("library-screen", LibraryScreen)









