import { PlaylistData } from "./data-models.js"
import { MediaTile } from "./media-tile.js"

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









