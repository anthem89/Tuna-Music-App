import { ContextMenu } from "./context-menu.js"
import { DownloadSongToLibrary, RemoveSongsFromLibrary, PlaylistCache, AddSongsToPlaylist } from "../app-functions.js"
import { SongTile } from "./song-tile.js"
import { AlertBanner } from "../index.js"
import { OpenCreatePlaylistDialog } from "../app-functions.js"
import { isMobileView } from "../utils.js"
import { TrackData } from "./data-models.js"

export class SongActionsMenu extends ContextMenu {
	constructor(parentPlaylistId) {

		super(null, [], "context", true)
		this.customClass = "media-actions-menu"
		this.parentPlaylistId = parentPlaylistId

		/** @type {SongTile} */
		this.targetSongTile = null

		this._menuOptions = [
			{
				customHTML: "", // Insert the song tile data here when the menu opens
				disabled: true,
				hidden: false,
			},
			"divider",
			{
				text: "Play song",
				iconClass: "bi bi-play-circle",
				clickEvent: () => { this.#playSong() }
			},
			{
				text: "Add to playlist",
				iconClass: "bi bi-music-note-list",
				subMenu: [
					{
						text: "Create new playlist",
						iconClass: "bi bi-plus-circle",
						clickEvent: () => { OpenCreatePlaylistDialog({ addSongIdOnSubmit: this.targetSongTile.trackData.id }) }
					}
				]
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

	/** @param {SongTile} targetSongTile */
	ForceShow(posX, posY, targetElementHeight, defaultSelection, autoPosition, targetSongTile) {
		this.targetSongTile = targetSongTile
		this.#createMenuHeader(this.targetSongTile.trackData)
		this.#populateUserPlaylists()
		this.SetVisibleOptions({ downloadToLibrary: targetSongTile.trackData.id == null && !targetSongTile.isDownloading })
		super.ForceShow(posX, posY, targetElementHeight, defaultSelection, autoPosition, targetSongTile)
	}

	/** @param {TrackData} trackData */
	#createMenuHeader(trackData) {
		this._menuOptions[0].hidden = !isMobileView()
		// If mobile view action sheet, then show the song information at the top of the context menu
		if (this._menuOptions[0].hidden === false) {
			this._menuOptions[0].customHTML = `
				<div class="media-actions-menu-header">
					<img src="${trackData.album_art || "../../assets/img/no-album-art.png"}">
					<div class="media-tile-text-div">
						<span class="media-tile-primary-text">${trackData.title}</span>
						<span class="media-tile-secondary-text">${trackData.artist}</span>
					</div>
				</div>
			`
		}
	}

	#populateUserPlaylists() {
		const addToPlaylist = this._menuOptions.find((menuItem) => menuItem.text === "Add to playlist")
		if (addToPlaylist != null && Array.isArray(PlaylistCache)) {
			addToPlaylist.subMenu.splice(1)
			// Don't allow song to be re-added to the current playlist
			const playlistMenuItems = PlaylistCache.filter((playlistItem)=>playlistItem.id !== this.parentPlaylistId).map((playlistItem) => {
				return {
					text: playlistItem.title,
					iconClass: "bi bi-music-note-beamed",
					clickEvent: () => { AddSongsToPlaylist(playlistItem.id, [this.targetSongTile.trackData.id]) }
				}
			})
			addToPlaylist.subMenu.push(...playlistMenuItems)
		}
	}

	SetVisibleOptions({ playSong, addToPlaylist, removeFromPlaylist, downloadToLibrary, removeFromLibrary, downloadToDevice, playNext, addToQueue, viewArtist, viewAlbum, editSongAttributes } = {}) {
		for (let option of this._menuOptions) {
			if (option === "divider") { continue }
			if (option.text === "Play song") { if (playSong != null) { option.hidden = !playSong } }
			if (option.text === "Add to playlist") { if (addToPlaylist != null) { option.hidden = !addToPlaylist } }
			if (option.text === "Remove from playlist") { if (removeFromPlaylist != null) { option.hidden = !removeFromPlaylist } }
			if (option.text === "Download to library") { if (downloadToLibrary != null) { option.hidden = !downloadToLibrary } }
			if (option.text === "Remove from library") { if (removeFromLibrary != null) { option.hidden = !removeFromLibrary } }
			if (option.text === "Download to device") { if (downloadToDevice != null) { option.hidden = !downloadToDevice } }
			if (option.text === "Play next") { if (playNext != null) { option.hidden = !playNext } }
			if (option.text === "Add to queue") { if (addToQueue != null) { option.hidden = !addToQueue } }
			if (option.text === "View artist") { if (viewArtist != null) { option.hidden = !viewArtist } }
			if (option.text === "View album") { if (viewAlbum != null) { option.hidden = !viewAlbum } }
			if (option.text === "Edit song attributes") { if (editSongAttributes != null) { option.hidden = !editSongAttributes } }
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
		targetSongTile.Play(this.parentPlaylistId)
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
			targetSongTile.ToggleDownloadingSpinner(true)
			// Download the song
			const libraryUuid = await DownloadSongToLibrary(trackData)
			targetSongTile.trackData.id = libraryUuid
			targetSongTile.closest("tr")?.querySelector(".already-downloaded-checkmark")?.classList.toggle("hidden", false)
			AlertBanner.Toggle(true, true, "Song added to library", 7000, AlertBanner.bannerColors.success)
		} catch (e) {
			AlertBanner.Toggle(true, true, "Error downloading song", 7000, AlertBanner.bannerColors.error)
		}
		targetSongTile.ToggleDownloadingSpinner(false)
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




