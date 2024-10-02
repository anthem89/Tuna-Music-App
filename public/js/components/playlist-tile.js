import { PlaylistData } from "./data-models.js"
import { isNullOrWhiteSpace } from "../utils.js"
import { MediaTile } from "./media-tile.js"
import { AlertBanner, SwitchToScreen } from "../index.js"

export class PlaylistTile extends MediaTile {
	/** @param {PlaylistData} playlistData */
	constructor(playlistData) {
		super(playlistData.playlist_image, playlistData.title || "Untitled Playlist", "Playlist")
		this.playlistData = playlistData
	}

	connectedCallback() {
		super.connectedCallback()
	}

	disconnectedCallback() {
		super.disconnectedCallback()
	}
}

customElements.define("playlist-tile", PlaylistTile)









