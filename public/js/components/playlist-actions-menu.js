import { ContextMenu } from "./context-menu.js"
import { PlaylistTile } from "./playlist-tile.js"
import { isMobileView } from "../utils.js"
import { MultiSelectMenu, AlertBanner, AudioPlayerElement } from "../index.js"
import { TrackData, PlaylistData } from "./data-models.js"
import * as AppFunctions from "../app-functions.js"

export class PlaylistActionsMenu extends ContextMenu {
	constructor(parentMediaListTable) {

		super(null, [], "context", true)
		this.customClass = "media-actions-menu"

		/** @type {PlaylistData[]} */
		this.playlistDataArray = null
		/** @type {PlaylistTile} */
		this.targetPlaylistTile = null
		/** @type {HTMLElement} */
		this.parentMediaListTable = parentMediaListTable

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
				clickEvent: () => { this.#playPlaylist() }
			},
			{
				text: "Set to play next",
				iconClass: "bi bi-arrow-return-right",
				clickEvent: () => {
					MultiSelectMenu.DisableMultiSelectMode()
					this.#setToPlayNext()
				}
			},
			{
				text: "Add playlist to queue",
				iconClass: "bi bi-list-task",
				clickEvent: () => {
					MultiSelectMenu.DisableMultiSelectMode()
					this.#addPlaylistToQueue()
				}
			},
			"divider",
			{
				text: "Download to device",
				iconClass: "bi bi-download",
				clickEvent: () => {
					MultiSelectMenu.DisableMultiSelectMode()
					this.#downloadToDevice()
				}
			},
			"divider",
			{
				text: "Copy to new playlist",
				iconClass: "bi bi-copy",
				clickEvent: () => {
					MultiSelectMenu.DisableMultiSelectMode()
					this.#copyPlaylist()
				}
			},
			{
				text: "Delete playlist",
				iconClass: "bi bi-trash",
				clickEvent: () => {
					MultiSelectMenu.DisableMultiSelectMode()
					this.#deletePlaylist()
				}
			},
			{
				text: "Edit playlist attributes",
				iconClass: "bi bi-pencil-square",
				clickEvent: () => {
					MultiSelectMenu.DisableMultiSelectMode()
					this.#editPlaylistAttributes()
				}
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

	SetVisibleOptions({ playPlaylist, playNext, addPlaylistToQueue, downloadToDevice, copyPlaylist, deletePlaylist, editPlaylistAttributes } = {}) {
		for (let option of this._menuOptions) {
			if (option === "divider") { continue }
			if (option.text === "Play playlist") { if (playPlaylist != null) { option.hidden = !playPlaylist } }
			if (option.text === "Set to play next") { if (playNext != null) { option.hidden = !playNext } }
			if (option.text === "Add playlist to queue") { if (addPlaylistToQueue != null) { option.hidden = !addPlaylistToQueue } }
			if (option.text === "Download to device") { if (downloadToDevice != null) { option.hidden = !downloadToDevice } }
			if (option.text === "Copy to new playlist") { if (copyPlaylist != null) { option.hidden = !copyPlaylist } }
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

	#getTrackDataArrayForSelectedPlaylists() {
		return new Promise(async (resolve, reject) => {
			try {
				/** @type {TrackData[]} */
				const trackDataArray = []
				for (const playlistData of this.playlistDataArray) {
					let trackData = await AppFunctions.GetPlaylistTrackDataArray(playlistData.id)
					if (trackData != null) {
						trackDataArray.push(...trackData)
					}
				}
				resolve(trackDataArray)
			} catch (e) {
				reject(e)
			}
		})
	}

	#playPlaylist() {
		if (this.targetPlaylistTile == null) { return }
		this.targetPlaylistTile.Play()
	}

	async #setToPlayNext() {
		try {
			/** @type {TrackData[]} */
			const trackDataArray = await this.#getTrackDataArrayForSelectedPlaylists()
			const reversed = structuredClone(trackDataArray).reverse()
			for (let trackData of reversed) {
				await AudioPlayerElement.SetTrackToPlayNextInQueue(trackData)
			}
			AlertBanner.Toggle(true, true, "Added " + reversed.length + " song(s) to play next", 7000, AlertBanner.bannerColors.success)
		} catch (e) {
			AlertBanner.Toggle(true, true, "Error adding song(s) to play next", 7000, AlertBanner.bannerColors.error)
			console.error(e)
		}
	}

	async #addPlaylistToQueue() {
		try {
			/** @type {TrackData[]} */
			const trackDataArray = await this.#getTrackDataArrayForSelectedPlaylists()
			let totalCount = trackDataArray.length
			let songAlreadyInQueueCount = 0
			trackDataArray.forEach((trackData) => {
				if (AudioPlayerElement.AddTrackToQueue(trackData, "end") === false) {
					songAlreadyInQueueCount++
				}
			})

			if (songAlreadyInQueueCount === totalCount && totalCount > 0) {
				AlertBanner.Toggle(true, true, "Song(s) already in queue", 7000, AlertBanner.bannerColors.info)
			} else {
				totalCount = totalCount - songAlreadyInQueueCount
				const plural = totalCount !== 1 ? "s" : ""
				AlertBanner.Toggle(true, true, (totalCount + " song" + plural + " added to queue"), 7000, AlertBanner.bannerColors.success)
			}
		} catch (e) {
			AlertBanner.Toggle(true, true, "Error adding song(s) to queue", 7000, AlertBanner.bannerColors.error)
			console.error(e)
		}
	}

	async #downloadToDevice() {
		try {
			/** @type {TrackData[]} */
			const trackDataArray = await this.#getTrackDataArrayForSelectedPlaylists()
			AppFunctions.DownloadSongsToDevice(trackDataArray)
		} catch (e) {
			console.error(e)
		}
	}

	async #copyPlaylist() {
		try {
			/** @type {TrackData[]} */
			const trackDataArray = await this.#getTrackDataArrayForSelectedPlaylists()
			const trackIdArray = trackDataArray.map((trackData) => trackData.id)
			AppFunctions.OpenPlaylistAttributesDialog(trackIdArray, "copy", null)
		} catch (e) {
			console.error(e)
		}
	}

	async #deletePlaylist() {
		try {
			// Handle removing the playlistTile visually from the page
			/** @type {PlaylistTile[]} */
			const allPlaylistTiles = Array.from(this.parentMediaListTable.querySelectorAll("playlist-tile"))
			const targetPlaylistIds = this.playlistDataArray.map((playlistData) => playlistData.id)
			const targetPlaylistTiles = allPlaylistTiles.filter((playlistTile) => targetPlaylistIds.includes(playlistTile.playlistData.id))
			for (let playlistTile of targetPlaylistTiles) {
				if (AudioPlayerElement.currentPlaylistId === playlistTile.playlistData.id) {
					AudioPlayerElement.currentPlaylistId = null
				}
				playlistTile.Remove()
			}
			// Handle removing the playlist in the appropriate database table
			await AppFunctions.DeletePlaylists(targetPlaylistIds)
		} catch (e) {
			console.error(e)
		}
	}

	#editPlaylistAttributes() {
		if (this.targetPlaylistTile == null) { return }
		AppFunctions.OpenPlaylistAttributesDialog(null, "edit", this.targetPlaylistTile)
	}

	Dispose() {
		this.Destroy()
		this.menuCloseCallbacks = null
		this.playlistDataArray = null
		this.targetPlaylistTile = null
		this.parentMediaListTable = null
		this._menuOptions = null
	}
}




