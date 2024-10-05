import { TrackData } from "./data-models.js"
import { MediaTile } from "./media-tile.js"
import { AudioPlayerElement } from "../index.js"
import { InfiniteScrollSongs } from "./infinite-scroll-songs.js"

export class SongTile extends MediaTile {
	/** @param {TrackData} trackData */
	constructor(trackData) {
		super(trackData.album_art, trackData.title || "Unknown", trackData.artist || "Unknown")
		this.trackData = trackData
	}

	connectedCallback() {
		super.connectedCallback()
	}

	async Play(parentPlaylistId) {
		try {
			if (this.isBuffering === true) { return }
			this.ToggleBufferingSpinner(true)

			if (AudioPlayerElement.currentPlaylistId !== parentPlaylistId || parentPlaylistId == null) {
				/** @type {InfiniteScrollSongs} */
				const parentInfiniteScroll = this.closest("infinite-scroll-songs")
				AudioPlayerElement.UpdateQueue([...parentInfiniteScroll?.trackDataArray] || [], parentPlaylistId)
			}

			await AudioPlayerElement.PlaySong(this.trackData, false)

		} catch { }
		this.ToggleBufferingSpinner(false)
	}

	Remove(parentPlaylistId, ignorePlaylistId) {
		/** @type {InfiniteScrollSongs} */
		const parentInfiniteScroll = this.closest("infinite-scroll-songs")
		// Remove the track's DOM element
		if (parentInfiniteScroll != null) {
			parentInfiniteScroll.RemoveTrack(this.trackData)
		} else {
			this.closest("tr").remove()
		}
		// Remove the track from the now playing queue if appropriate
		if (parentPlaylistId === AudioPlayerElement.currentPlaylistId || ignorePlaylistId === true) {
			AudioPlayerElement.RemoveTrackFromQueue(this.trackData)
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback()
	}
}

customElements.define("song-tile", SongTile)









