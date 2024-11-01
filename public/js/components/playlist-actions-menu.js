import { ContextMenu } from "./context-menu.js"
import { PlaylistTile } from "./playlist-tile.js"
import { isMobileView } from "../utils.js"
import { PlaylistData } from "./data-models.js"
import { MultiSelectMenu } from "../index.js"

export class PlaylistActionsMenu extends ContextMenu {
	constructor() {

		super(null, [], "context", true)
		this.customClass = "media-actions-menu"

		/** @type {PlaylistData[]} */
		this.playlistDataArray = null
		/** @type {PlaylistTile} */
		this.targetPlaylistTile = null

		this.menuCloseCallbacks["beforePlaylistActionsMenuClose"] = () => {
			this.playlistDataArray = null
			this.targetPlaylistTile = null
		}

		this._menuOptions = [
			{
				customHTML: "", // Insert the playlist data here when the menu opens
				disabled: true,
				hidden: true,
			},
			"divider",
			{
				text: "Play playlist",
				iconClass: "bi bi-play-circle",
				clickEvent: () => { }
			},
			{
				text: "Add playlist to queue",
				iconClass: "bi bi-list-task",
				clickEvent: () => { }
			},
			"divider",
			{
				text: "Download to device",
				iconClass: "bi bi-download",
				clickEvent: () => { }
			},
			"divider",
			{
				text: "Copy playlist",
				iconClass: "bi bi-copy",
				clickEvent: () => { }
			},
			{
				text: "Delete playlist",
				iconClass: "bi bi-trash",
				clickEvent: () => { }
			},
			{
				text: "Edit playlist attributes",
				iconClass: "bi bi-pencil-square",
				clickEvent: () => { }
			},
		]

	}

	ForceShow(posX, posY, targetElementHeight, defaultSelection, autoPosition, playlistDataArray, targetPlaylistTile, autoCloseMultiSelectMenu = true) {
		if (autoCloseMultiSelectMenu === true && MultiSelectMenu.multiSelectModeEnabled === true) { MultiSelectMenu.DisableMultiSelectMode(true) }

		this.playlistDataArray = playlistDataArray || []
		this.targetPlaylistTile = targetPlaylistTile

		this.#createMenuHeader()

		super.ForceShow(posX, posY, targetElementHeight, defaultSelection, autoPosition, targetPlaylistTile)
	}

	#createMenuHeader() {
		if (this.targetPlaylistTile != null) {
			this._menuOptions[0].hidden = !isMobileView()
			// If mobile view action sheet, then show the song information at the top of the context menu
			if (this._menuOptions[0].hidden === true) { return }
			this._menuOptions[0].customHTML = `
				<div class="media-actions-menu-header">
					<img src="${this.targetPlaylistTile.playlistData.playlist_image || "../../assets/img/no-album-art.png"}">
					<div class="media-tile-text-div">
						<span class="media-tile-primary-text">${this.targetPlaylistTile.playlistData.title}</span>
						<span class="media-tile-secondary-text">Playlist</span>
					</div>
				</div>
			`
		} else {
			this._menuOptions[0].hidden = false
			this._menuOptions[0].customHTML = `
				<div class="multi-select-header">${this.playlistDataArray.length + " Item" + (this.playlistDataArray.length === 1 ? "" : "s") + " Selected"}</div>
			`
		}
	}

	SetVisibleOptions({ playPlaylist, addPlaylistToQueue, downloadToDevice, copyPlaylist, deletePlaylist, editPlaylistAttributes } = {}) {
		for (let option of this._menuOptions) {
			if (option === "divider") { continue }
			if (option.text === "Play playlist") { if (playPlaylist != null) { option.hidden = !playPlaylist } }
			if (option.text === "Add playlist to queue") { if (addPlaylistToQueue != null) { option.hidden = !addPlaylistToQueue } }
			if (option.text === "Download to device") { if (downloadToDevice != null) { option.hidden = !downloadToDevice } }
			if (option.text === "Copy playlist") { if (copyPlaylist != null) { option.hidden = !copyPlaylist } }
			if (option.text === "Delete playlist") { if (deletePlaylist != null) { option.hidden = !deletePlaylist } }
			if (option.text === "Edit playlist attributes") { if (editPlaylistAttributes != null) { option.hidden = !editPlaylistAttributes } }
		}
	}

	ResetVisibleOptions() {
		for (let option of this._menuOptions) {
			if (option === "divider") { continue }
			option.hidden = false
		}
	}

}




