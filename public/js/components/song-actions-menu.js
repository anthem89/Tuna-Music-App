import { ContextMenu } from "./context-menu.js"
import * as AppFunctions from "../app-functions.js"
import { SongTile } from "./song-tile.js"
import { AlertBanner, AudioPlayerElement, FeatureNotAvailableYetNotice, MultiSelectMenu } from "../index.js"
import { isMobileView } from "../utils.js"
import { TrackData } from "./data-models.js"
import { InfiniteScrollSongs } from "./infinite-scroll-songs.js"

export class SongActionsMenu extends ContextMenu {
	constructor(parentPlaylistId, parentMediaListTable) {

		super(null, [], "context", true)
		this.customClass = "media-actions-menu"
		this.parentPlaylistId = parentPlaylistId
		this.parentMediaListTable = parentMediaListTable

		/** @type {TrackData[]} */
		this.trackDataArray = null
		/** @type {SongTile} */
		this.targetSongTile = null

		this.menuCloseCallbacks["beforeSongActionsMenuClose"] = () => {
			this.trackDataArray = null
			this.targetSongTile = null
		}

		this._menuOptions = [
			{
				customHTML: "", // Insert the song tile data here when the menu opens
				disabled: true,
				hidden: true,
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
			},
			{
				text: "Remove from playlist",
				iconClass: "bi bi-dash-circle",
				clickEvent: () => {
					MultiSelectMenu.DisableMultiSelectMode()
					this.#removeSongsFrom("playlist")
				}
			},
			"divider",
			{
				text: "Download to library",
				iconClass: "bi bi-collection",
				clickEvent: () => {
					MultiSelectMenu.DisableMultiSelectMode()
					this.#downloadToLibrary()
				}
			},
			{
				text: "Remove from library",
				iconClass: "bi bi-trash",
				clickEvent: () => {
					MultiSelectMenu.DisableMultiSelectMode()
					this.#removeSongsFrom("library")
				}
			},
			{
				text: "Download to device",
				iconClass: "bi bi-download",
				clickEvent: () => {
					MultiSelectMenu.DisableMultiSelectMode()
					AppFunctions.DownloadSongsToDevice(this.trackDataArray)
				}
			},
			"divider",
			{
				text: "Set to play next",
				iconClass: "bi bi-arrow-return-right",
				clickEvent: async () => {
					MultiSelectMenu.DisableMultiSelectMode()
					const reversed = structuredClone(this.trackDataArray).reverse()
					for (let trackData of reversed) {
						await AudioPlayerElement.SetTrackToPlayNextInQueue(trackData)
					}
				}
			},
			{
				text: "Add to queue",
				iconClass: "bi bi-list-task",
				clickEvent: () => {
					MultiSelectMenu.DisableMultiSelectMode()
					this.#addToQueue()
				}
			},
			{
				text: "Remove from queue",
				iconClass: "bi bi-list-task",
				clickEvent: () => {
					MultiSelectMenu.DisableMultiSelectMode()
					this.#removeSongsFrom("queue")
				}
			},
			"divider",
			{
				text: "View artist",
				iconClass: "bi bi-person",
				clickEvent: () => { FeatureNotAvailableYetNotice() }
			},
			{
				text: "View album",
				iconClass: "bi bi-disc",
				clickEvent: () => { FeatureNotAvailableYetNotice() }
			},
			"divider",
			{
				text: "Edit song attributes",
				iconClass: "bi bi-pencil-square",
				clickEvent: () => { FeatureNotAvailableYetNotice() }
			},
		]

	}

	/**
	 * @param {TrackData[]} trackDataArray
	 * @param {SongTile} targetSongTile
	 **/
	ForceShow(posX, posY, targetElementHeight, defaultSelection, autoPosition, trackDataArray, targetSongTile = null, autoCloseMultiSelectMenu = true) {
		if (autoCloseMultiSelectMenu === true && MultiSelectMenu.multiSelectModeEnabled === true) { MultiSelectMenu.DisableMultiSelectMode(true) }

		this.targetSongTile = targetSongTile
		this.trackDataArray = trackDataArray || []

		this.#populateUserPlaylists()
		this.#createMenuHeader()

		if (this.targetSongTile != null) {
			const trackPositionInNowPlayingQueue = AudioPlayerElement.GetTrackIndexInQueue(this.targetSongTile.trackData)
			const trackExistsInNowPlayingQueue = trackPositionInNowPlayingQueue > -1
			const trackIsCurrentlyPlaying = trackPositionInNowPlayingQueue === AudioPlayerElement.currentQueueIndex

			this.SetVisibleOptions({
				downloadToLibrary: this.trackDataArray[0].id == null && !this.targetSongTile.isDownloading,
				addToQueue: !trackExistsInNowPlayingQueue,
				removeFromQueue: trackExistsInNowPlayingQueue,
				playNext: !trackIsCurrentlyPlaying,
			})
		}

		super.ForceShow(posX, posY, targetElementHeight, defaultSelection, autoPosition, this.targetSongTile)
	}

	#createMenuHeader() {
		if (this.targetSongTile != null) {
			this._menuOptions[0].hidden = !isMobileView()
			// If mobile view action sheet, then show the song information at the top of the context menu
			if (this._menuOptions[0].hidden === true) { return }
			this._menuOptions[0].customHTML = `
				<div class="media-actions-menu-header">
					<img src="${this.targetSongTile.trackData.album_art || "../../assets/img/no-album-art.png"}">
					<div class="media-tile-text-div">
						<span class="media-tile-primary-text">${this.targetSongTile.trackData.title}</span>
						<span class="media-tile-secondary-text">${this.targetSongTile.trackData.artist}</span>
					</div>
				</div>
			`
		} else {
			this._menuOptions[0].hidden = false
			this._menuOptions[0].customHTML = `
				<div class="multi-select-header">${this.trackDataArray.length + " Item" + (this.trackDataArray.length === 1 ? "" : "s") + " Selected"}</div>
			`
		}
	}

	#populateUserPlaylists() {
		const trackIdArray = this.trackDataArray.map((trackData) => trackData.id)
		const addToPlaylist = this._menuOptions.find((menuItem) => menuItem.text === "Add to playlist")
		if (addToPlaylist != null && Array.isArray(AppFunctions.PlaylistCache)) {
			addToPlaylist.subMenu = []
			addToPlaylist.subMenu.push({
				text: "Create new playlist",
				iconClass: "bi bi-plus-circle",
				clickEvent: () => {
					AppFunctions.OpenCreatePlaylistDialog({ addSongIdsOnSubmit: trackIdArray })
					MultiSelectMenu.DisableMultiSelectMode()
				}
			})
			addToPlaylist.subMenu.splice(1)
			// Don't allow song to be re-added to the current playlist
			const playlistMenuItems = AppFunctions.PlaylistCache.filter((playlistItem) => playlistItem.id !== this.parentPlaylistId).map((playlistItem) => {
				return {
					text: playlistItem.title,
					iconClass: "bi bi-music-note-beamed",
					clickEvent: () => {
						AppFunctions.AddSongsToPlaylist(playlistItem.id, trackIdArray)
						MultiSelectMenu.DisableMultiSelectMode()
					}
				}
			})
			addToPlaylist.subMenu.push(...playlistMenuItems)
		}
	}

	SetVisibleOptions({ playSong, addToPlaylist, removeFromPlaylist, downloadToLibrary, removeFromLibrary, downloadToDevice, playNext, addToQueue, removeFromQueue, viewArtist, viewAlbum, editSongAttributes } = {}) {
		for (let option of this._menuOptions) {
			if (option === "divider") { continue }
			if (option.text === "Play song") { if (playSong != null) { option.hidden = !playSong } }
			if (option.text === "Add to playlist") { if (addToPlaylist != null) { option.hidden = !addToPlaylist } }
			if (option.text === "Remove from playlist") { if (removeFromPlaylist != null) { option.hidden = !removeFromPlaylist } }
			if (option.text === "Download to library") { if (downloadToLibrary != null) { option.hidden = !downloadToLibrary } }
			if (option.text === "Remove from library") { if (removeFromLibrary != null) { option.hidden = !removeFromLibrary } }
			if (option.text === "Download to device") { if (downloadToDevice != null) { option.hidden = !downloadToDevice } }
			if (option.text === "Set to play next") { if (playNext != null) { option.hidden = !playNext } }
			if (option.text === "Add to queue") { if (addToQueue != null) { option.hidden = !addToQueue } }
			if (option.text === "Remove from queue") { if (removeFromQueue != null) { option.hidden = !removeFromQueue } }
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
		if (this.targetSongTile == null) { return }
		this.targetSongTile.Play(this.parentPlaylistId)
	}

	async #downloadToLibrary() {
		// IMPORTANT: this function assumes the song tiles that are being selected for download are NOT in an infinite scroll element (ie: they are not virtualized).
		// All song tiles must be present and attached to the DOM in the shadow root element of the #module-content-container section
		let songAlreadyDownloadedCount = 0
		let downloadFailureCount = 0
		let downloadPromises = []
		/** @type {SongTile[]} */
		const allSongTiles = Array.from(this.parentMediaListTable.querySelectorAll(".media-tile"))
		const targetVideoIds = this.trackDataArray.map((trackData) => trackData.video_id)
		const targetSongTiles = allSongTiles.filter((songTile) => targetVideoIds.includes(songTile.trackData.video_id))
		const totalCount = this.trackDataArray.length
		for (let songTile of targetSongTiles) {
			if (songTile.trackData.id != null) {
				songAlreadyDownloadedCount++
				continue
			}
			const downloadPromise = new Promise(async (resolve) => {
				try {
					songTile.ToggleDownloadingSpinner(true)
					const libraryUuid = await AppFunctions.DownloadSongToLibrary(songTile.trackData)
					songTile.trackData.id = libraryUuid
					songTile.closest("tr")?.querySelectorAll(".already-downloaded-checkmark").forEach((el) => { el.classList.toggle("hidden", false) })
				} catch (e) {
					downloadFailureCount++
				}
				if (AudioPlayerElement.currentPlaylistId === "all-songs") {
					AudioPlayerElement.AddTrackToQueue(songTile.trackData, "start")
				}
				songTile.ToggleDownloadingSpinner(false)
				resolve()
			})
			downloadPromises.push(downloadPromise)
		}
		await Promise.all(downloadPromises)
		const plural = totalCount !== 1 ? "s" : ""
		if (songAlreadyDownloadedCount === totalCount) {
			AlertBanner.Toggle(true, true, "Song(s) already in library", 7000, AlertBanner.bannerColors.info)
		} else if (downloadFailureCount === totalCount) {
			AlertBanner.Toggle(true, true, ("Error downloading " + totalCount + " song" + plural), 7000, AlertBanner.bannerColors.error)
		} else {
			AlertBanner.Toggle(true, true, (totalCount + " song" + plural + " added to library"), 7000, AlertBanner.bannerColors.success)
		}
	}

	/** @param {String} removeFrom Options are "library", "playlist", "queue" */
	async #removeSongsFrom(removeFrom) {
		removeFrom = removeFrom.toLowerCase()
		const totalCount = this.trackDataArray.length
		const plural = totalCount !== 1 ? "s" : ""
		try {
			// Handle removing the songTile visually from the page
			const targetTrackIds = this.trackDataArray.map((trackData) => trackData.id)
			/** @type {InfiniteScrollSongs} */
			const parentInfiniteScroll = this.parentMediaListTable.closest("infinite-scroll-songs")
			if (parentInfiniteScroll != null) {
				if (removeFrom !== "queue" || (removeFrom === "queue" && this.parentPlaylistId === "now-playing-queue")) {
					parentInfiniteScroll.RemoveTracks(this.trackDataArray)
				}
				if (["queue", "library"].includes(removeFrom) || (removeFrom === "playlist" && AudioPlayerElement.currentPlaylistId === this.parentPlaylistId)) {
					for (let trackData of this.trackDataArray) {
						await AudioPlayerElement.RemoveTrackFromQueue(trackData)
					}
				}
			} else {
				/** @type {SongTile[]} */
				const allSongTiles = Array.from(this.parentMediaListTable.querySelectorAll(".media-tile"))
				const targetSongTiles = allSongTiles.filter((songTile) => targetTrackIds.includes(songTile.trackData.id))
				for (let songTile of targetSongTiles) {
					if (removeFrom !== "queue" || (removeFrom === "queue" && this.parentPlaylistId === "now-playing-queue")) {
						// The SongTile.Remove method also automatically detects and removes the track from the now-playing queue if appropriate
						songTile.Remove(this.parentPlaylistId, true)
					} else if (removeFrom === "queue") {
						await AudioPlayerElement.RemoveTrackFromQueue(songTile.trackData)
					}
				}
			}
			// Handle removing the track in the appropriate database table
			if (removeFrom === "library") {
				await AppFunctions.RemoveSongsFromLibrary(targetTrackIds)
			} else if (removeFrom === "playlist") {
				await AppFunctions.RemoveSongsFromPlaylist(this.parentPlaylistId, targetTrackIds)
			}

			AlertBanner.Toggle(true, true, (totalCount + " song" + plural + " removed from " + removeFrom), 7000, AlertBanner.bannerColors.success)
		} catch (e) {
			AlertBanner.Toggle(true, true, "Error removing song(s) from " + removeFrom, 7000, AlertBanner.bannerColors.error)
		}
	}

	#addToQueue() {
		const totalCount = this.trackDataArray.length
		let songAlreadyInQueueCount = 0
		this.trackDataArray.forEach((trackData) => {
			if (AudioPlayerElement.AddTrackToQueue(trackData, "end") === false) {
				songAlreadyInQueueCount++
			}
		})
		const plural = totalCount !== 1 ? "s" : ""
		if (songAlreadyInQueueCount === totalCount) {
			AlertBanner.Toggle(true, true, "Song(s) already in queue", 7000, AlertBanner.bannerColors.info)
		} else {
			AlertBanner.Toggle(true, true, (totalCount + " song" + plural + " added to queue"), 7000, AlertBanner.bannerColors.success)
		}
	}
}




