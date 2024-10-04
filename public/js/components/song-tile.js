import { TrackData } from "./data-models.js"
import { MediaTile } from "./media-tile.js"
import { AudioPlayerElement } from "../index.js"

export class SongTile extends MediaTile {
	/** @param {TrackData} trackData */
	constructor(trackData) {
		super(trackData.album_art, trackData.title || "Unknown", trackData.artist || "Unknown")
		this.trackData = trackData
	}

	connectedCallback() {
		super.connectedCallback()
	}

	async Play(parentPlaylistId = null) {
		try {
			if (this.isBuffering === true) { return }
			this.ToggleBufferingSpinner(true)

			/** @type {InfiniteScrollSongs} */
			const parentInfiniteScroll = this.closest("infinite-scroll-songs")
			if (parentInfiniteScroll != null) {
				AudioPlayerElement.UpdateQueue(parentInfiniteScroll.trackDataArray)
			} else {
				AudioPlayerElement.ClearQueue()
			}
			await AudioPlayerElement.PlaySong(this.trackData, parentPlaylistId)

		} catch { } 
		this.ToggleBufferingSpinner(false)
	}

	disconnectedCallback() {
		super.disconnectedCallback()
	}
}

customElements.define("song-tile", SongTile)









