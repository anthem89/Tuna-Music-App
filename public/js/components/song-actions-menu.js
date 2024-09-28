import { ContextMenu } from "./context-menu.js"
import { DownloadSongToLibrary, RemoveSongsFromLibrary } from "../app-functions.js"
import { SongTile } from "./song-tile.js"
import { AlertBanner } from "../index.js"

export class SongActionsMenu extends ContextMenu {
	constructor() {

		super(null, [], "context", true)

		this._menuOptions = [
			{
				text: "Play song",
				iconClass: "bi bi-play-circle",
				clickEvent: () => { this.#playSong() }
			},
			{
				text: "Add to playlist",
				iconClass: "bi bi-music-note-list",
				clickEvent: () => { }
			},
			{
				text: "Remove from playlist",
				iconClass: "bi bi-dash-circle",
				clickEvent: () => { }
			},
			"divider",
			{
				text: "Download to library",
				iconClass: "bi bi-collection",
				clickEvent: () => { this.#downloadToLibrary() }
			},
			{
				text: "Remove from library",
				iconClass: "bi bi-trash",
				clickEvent: () => { this.#removeFromLibrary() }
			},
			{
				text: "Download to device",
				iconClass: "bi bi-download",
				clickEvent: () => { }
			},
			"divider",
			{
				text: "Play next",
				iconClass: "bi bi-arrow-return-right",
				clickEvent: () => { }
			},
			{
				text: "Add to queue",
				iconClass: "bi bi-list-task",
				clickEvent: () => { }
			},
			"divider",
			{
				text: "View artist",
				iconClass: "bi bi-person",
				clickEvent: () => { }
			},
			{
				text: "View album",
				iconClass: "bi bi-disc",
				clickEvent: () => { }
			},
			"divider",
			{
				text: "Edit song attributes",
				iconClass: "bi bi-pencil-square",
				clickEvent: () => { }
			},
		]

	}

	SetVisibleOptions({ playSong, addToPlaylist, removeFromPlaylist, downloadToLibrary, removeFromLibrary, downloadToDevice, playNext, addToQueue, viewArtist, viewAlbum, editSongAttributes } = {}) {
		for (let option of this._menuOptions) {
			if (option === "divider") { continue }
			if (option.text === "Play song" && playSong === false) { option.hidden = true }
			if (option.text === "Add to playlist" && addToPlaylist === false) { option.hidden = true }
			if (option.text === "Remove from playlist" && removeFromPlaylist === false) { option.hidden = true }
			if (option.text === "Download to library" && downloadToLibrary === false) { option.hidden = true }
			if (option.text === "Remove from library" && removeFromLibrary === false) { option.hidden = true }
			if (option.text === "Download to device" && downloadToDevice === false) { option.hidden = true }
			if (option.text === "Play next" && playNext === false) { option.hidden = true }
			if (option.text === "Add to queue" && addToQueue === false) { option.hidden = true }
			if (option.text === "View artist" && viewArtist === false) { option.hidden = true }
			if (option.text === "View album" && viewAlbum === false) { option.hidden = true }
			if (option.text === "Edit song attributes" && editSongAttributes === false) { option.hidden = true }
		}
	}

	ResetVisibleOptions() {
		for (let option of this._menuOptions) {
			if (option === "divider") { continue }
			option.hidden = false
		}
	}

	async #playSong() {
		/** @type {SongTile} */
		const targetSongTile = this.targetElement
		targetSongTile.PlaySong()
	}

	async #downloadToLibrary() {
		/** @type {SongTile} */
		const targetSongTile = this.targetElement
		try {
			const trackData = targetSongTile.trackData
			if (trackData.id != null) {
				AlertBanner.Toggle(true, true, "Song already exists in library", 7000, AlertBanner.bannerColors.info)
				return
			}
			targetSongTile.ToggleLoadingMask(true)
			// Download the song
			await DownloadSongToLibrary(trackData)
		} catch (e) {
			AlertBanner.Toggle(true, true, "Error downloading song", 7000, AlertBanner.bannerColors.error)
		}
		targetSongTile.ToggleLoadingMask(false)
	}

	async #removeFromLibrary() {
		try {
			/** @type {SongTile} */
			const targetSongTile = this.targetElement
			RemoveSongsFromLibrary([targetSongTile.trackData.id])
			targetSongTile.closest("tr").remove()
		} catch (e) {
			AlertBanner.Toggle(true, true, "Error removing song(s) from library", 7000, AlertBanner.bannerColors.error)
		}
	}

}




