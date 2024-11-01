import { PlaylistData } from "./data-models.js"
import { MediaTile } from "./media-tile.js"
import { MultiSelectMenu } from "../index.js"

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

	disconnectedCallback() {
		super.disconnectedCallback()
	}
}

customElements.define("playlist-tile", PlaylistTile)