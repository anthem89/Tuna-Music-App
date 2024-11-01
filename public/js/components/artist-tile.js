import { ArtistData } from "./data-models.js"
import { MediaTile } from "./media-tile.js"

export class ArtistTile extends MediaTile {
	/** @param {ArtistData} artistData */
	constructor(artistData) {
		super(artistData.artist_image, artistData.artist || "Unknown Artist", "Artist", false)
		this.artistData = artistData
	}

	connectedCallback() {
		super.connectedCallback()
	}

	disconnectedCallback() {
		super.disconnectedCallback()
	}
}

customElements.define("artist-tile", ArtistTile)