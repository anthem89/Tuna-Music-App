import { PlaylistData } from "./data-models.js"
import { MediaTile } from "./media-tile.js"
import { MultiSelectMenu, AudioPlayerElement, AlertBanner } from "../index.js"
import { GetPlaylistTrackDataArray } from "../app-functions.js"

export class PlaylistTile extends MediaTile {
	/** @param {PlaylistData} playlistData */
	constructor(playlistData) {
		super(playlistData.playlist_image, playlistData.title || "Untitled Playlist", "Playlist", true)
		this.playlistData = playlistData
	}

	connectedCallback() {
		super.connectedCallback()

		// When the tile is added, test if it is part of the multi-select menu' currently selected items
		if (MultiSelectMenu.multiSelectArray.findIndex((item) => item.id === this.trackData.id) > -1) {
			this.checkbox.checked = true
		}
	}

	async Play() {
		try {
			const trackDataArray = await GetPlaylistTrackDataArray(this.playlistData.id)
			AudioPlayerElement.UpdateQueue(trackDataArray, this.playlistData.id)
			if (trackDataArray.length > 0) {
				AudioPlayerElement.PlaySong(trackDataArray[0], true)
			}
		} catch (e) {
			AlertBanner.Toggle(true, true, "Error playing playlist", 7000, AlertBanner.bannerColors.error)
		}
	}

	/** @param {PlaylistData} playlistData */
	UpdatePlaylistAttributes(playlistData) {
		const parentTable = this.closest("table")
		const descriptionColumnIndex = Array.from(parentTable.querySelectorAll("th")).findIndex((header)=> header.textContent.toLowerCase() === "description" )
		const descriptionCell = this.closest("tr").querySelector("td:nth-child(" + (descriptionColumnIndex + 1) + ")")
		descriptionCell.textContent = playlistData.description || ""
		this.primaryTextElement.textContent = playlistData.title || "Untitled Playlist"
	}

	Remove() {
		this.closest("tr").remove()
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		this.playlistData = null
		this.checkbox = null
	}
}

customElements.define("playlist-tile", PlaylistTile)