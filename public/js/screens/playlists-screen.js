import { CreateElementFromHTML, InjectGlobalStylesheets, RemoveAllChildren } from "../utils.js"
import { PlaylistData } from "../components/data-models.js"
import { PlaylistCache } from "../app-functions.js"
import { PlaylistTile } from "../components/playlist-tile.js"
import { DataTable } from "../components/data-table.js"
import { PlaylistActionsMenu } from "../components/playlist-actions-menu.js"
import { InfiniteScrollSongs } from "../components/infinite-scroll-songs.js"
import { SwitchToScreen } from "../index.js"

export class PlaylistsScreen extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: "open" })
	}

	async connectedCallback() {
		this.shadowRoot.innerHTML = `
			<link href="./js/screens/playlists-screen.css" rel="stylesheet" type="text/css">

			<div id="playlist-table-wrapper"></div>
		`
		InjectGlobalStylesheets(this)

		this.tableWrapper = this.shadowRoot.querySelector("#playlist-table-wrapper")
		this.tableWrapper.onclick = (e) => {
			this.#handleRowClick(e)
		}

		this.playlistActionsMenu = new PlaylistActionsMenu()

		const columnHeaders = ["Playlist", "Actions", "Description"]
		const tableData = []
		if (Array.isArray(PlaylistCache)) {
			PlaylistCache.forEach((playlistData) => {
				const playlistTile = new PlaylistTile(playlistData)
				const actionsHtml = `<div class="action-link-container"><a class="link-underline action-link" name="btn-actions">Actions</a></div>`
				const descriptionHtml = `<span class="clampTwoLines">${playlistData.description}</span>`
				tableData.push([playlistTile, CreateElementFromHTML(actionsHtml, false), CreateElementFromHTML(descriptionHtml, true)])
			})
		}
		const playlistTable = new DataTable(columnHeaders, tableData)
		playlistTable.classList.add("media-list-table")
		this.tableWrapper.appendChild(playlistTable)
	}

	#handleRowClick(e) {
		const actionLink = e.target.closest("a")
		const tableRow = e.target.closest("tr")
		/** @type {PlaylistTile} */
		const playlistTile = tableRow?.querySelector("playlist-tile")
		if (playlistTile == null) { return }
		if (actionLink != null) {
			const pos = actionLink.getBoundingClientRect()
			this.playlistActionsMenu.ForceShow(pos.x, pos.y + pos.height, pos.height, false, true, playlistTile)
		} else {
			if (e.target.closest(".btn-open-mobile-context-menu") != null) {
				// User clicked on the "More options" button
				this.playlistActionsMenu.ForceShow(0, 0, 0, false, false, playlistTile)
			} else {
				SwitchToScreen("playlistSongs", playlistTile.playlistData)
			}
		}
	}

	disconnectedCallback() {

	}
}

customElements.define("playlists-screen", PlaylistsScreen)