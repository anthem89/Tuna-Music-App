import { TrackData } from "./data-models.js"
import { MediaTile } from "./media-tile.js"
import { AudioPlayerElement } from "../index.js"
import { InfiniteScrollSongs } from "./infinite-scroll-songs.js"
import { MultiSelectMenu } from "../index.js"
import { AppSettings } from "../screens/settings-screen.js"

export class SongTile extends MediaTile {
	/** @param {TrackData} trackData */
	constructor(trackData) {
		super(trackData.album_art, trackData.title || "Unknown", trackData.artist || "Unknown", true)
		this.trackData = trackData
	}

	connectedCallback() {
		super.connectedCallback()

		// When the tile is added, test if it is part of the multi-select menu' currently selected items
		if (MultiSelectMenu.multiSelectArray.findIndex((item) => item.id === this.trackData.id) > -1) {
			this.checkbox.checked = true
		}
	}

	async Play(parentPlaylistId) {
		try {
			if (this.isBuffering === true) { return }
			this.ToggleBufferingSpinner(true)

			if (AppSettings.autoResetQueue === false && AudioPlayerElement.trackQueue.length > 0) {
				// Kellie's setting: playing a song adds it to the bottom of the queue instead of reseting the active queue to sync with the parent playlist
				AudioPlayerElement.AddTrackToQueue(this.trackData, "end")
			} else {
				// Normal setting: playing a song resets the active queue to sync with the parent playlist
				/** @type {InfiniteScrollSongs} */
				const parentInfiniteScroll = this.closest("infinite-scroll-songs")
				AudioPlayerElement.UpdateQueue(parentInfiniteScroll?.trackDataArray || [this.trackData], parentPlaylistId)
			}

			await AudioPlayerElement.PlaySong(this.trackData, false)

		} catch (e) {
			console.error(e)
		}
		this.ToggleBufferingSpinner(false)
	}

	Remove(parentPlaylistId, ignorePlaylistId) {
		return new Promise(async (resolve) => {
			try {
				/** @type {InfiniteScrollSongs} */
				const parentInfiniteScroll = this.closest("infinite-scroll-songs")
				// Remove the track's DOM element
				if (parentInfiniteScroll != null) {
					parentInfiniteScroll.RemoveTracks([this.trackData])
				} else {
					this.closest("tr").remove()
				}
				// Remove the track from the now playing queue if appropriate
				if (parentPlaylistId === AudioPlayerElement.currentPlaylistId || ignorePlaylistId === true) {
					await AudioPlayerElement.RemoveTrackFromQueue(this.trackData)
				}
			} catch { }
			resolve()
		})

	}

	disconnectedCallback() {
		super.disconnectedCallback()
	}
}

customElements.define("song-tile", SongTile)









