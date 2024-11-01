import { AlbumData } from "./data-models.js"
import { MediaTile } from "./media-tile.js"

export class AlbumTile extends MediaTile {
	/** @param {AlbumData} albumData */
	constructor(albumData) {
		super(albumData.album_art, albumData.album || "Untitled Album", "Album", false)
		this.albumData = albumData
	}

	connectedCallback() {
		super.connectedCallback()
	}

	disconnectedCallback() {
		super.disconnectedCallback()
	}
}

customElements.define("album-tile", AlbumTile)