import { ContextMenu } from "./context-menu.js"
import { PlaySongFromLibrary, PlaySongFromYouTube } from "../app-functions.js"
import { SongTile } from "./song-tile.js"
import { isNullOrWhiteSpace } from "../utils.js"
import { AlertBanner } from "../index.js"

export class SongActionsMenu extends ContextMenu {
	constructor() {

		super(null, [], "context", true)

		this._menuOptions = [
			{
				iconClass: "bi bi-plus-circle",
				text: "Add to playlist"
			},
			{
				iconClass: "bi bi-download",
				text: "Add to Library",
				clickEvent: () => { this.#downloadSong() }
			},
			{
				text: "Remove from library",
				iconClass: "bi bi-trash"
			},
			{
				text: "Play song",
				iconClass: "bi bi-play-circle",
				clickEvent: () => { this.#playSong() }
			}
		]
	}

	SetVisibleOptions({ addToPlaylist, removeFromPlaylist, viewAlbum, viewArtist, playSong, editSongAttributes, removeFromLibrary, addToLibrary } = {}) {

	}

	#playSong() {
		/** @type {SongTile} */
		const targetSongTile = this.targetElement
		if (isNullOrWhiteSpace(targetSongTile.trackData.id)) {
			PlaySongFromYouTube(targetSongTile.trackData.video_id)
		} else {
			PlaySongFromLibrary(targetSongTile.trackData.id)
		}
	}

	async #downloadSong() {
		/** @type {SongTile} */
		const targetSongTile = this.targetElement
		const trackData = targetSongTile.trackData
		if (trackData.id != null) {
			AlertBanner.Toggle(true, true, "Song already exists in library", 7000, AlertBanner.bannerColors.info)
			return
		}
		// Download the song
		const reqHeader = { "Content-Type": "application/json" }
		const res = await fetch("/download-song", { method: "POST", body: JSON.stringify(trackData), headers: reqHeader })
		const resJson = await res.json()
		if (resJson["libraryUuid"] == null) {
			AlertBanner.Toggle(true, true, "Error downloading song", 7000, AlertBanner.bannerColors.error)
		}
	}

}




