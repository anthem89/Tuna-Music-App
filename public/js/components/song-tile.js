import { TrackData } from "./data-models.js"
import { PlaySongFromLibrary, PlaySongFromYouTube } from "../app-functions.js"
import { isNullOrWhiteSpace } from "../utils.js"
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

		// When this tile loads, test if its video_id or id match the currently playing song, then set the "is-playing" attribute accordingly
		this.isCurrentlyPlaying()
	}

	isCurrentlyPlaying() {
		const idKeys = ["video_id", "id"]
		let isCurrentlyPlaying = false
		for (let idKey of idKeys) {
			isCurrentlyPlaying = this.trackData[idKey] != null && AudioPlayerElement.currentTrack?.[idKey] === this.trackData[idKey] && AudioPlayerElement.audioElement.ended === false
			if (isCurrentlyPlaying === true) { break }
		}
		this.classList.toggle("is-playing", isCurrentlyPlaying)
		return isCurrentlyPlaying
	}

	async PlaySong() {
		if (this.isLoading === true) { return }
		this.ToggleLoadingMask(true)
		if (isNullOrWhiteSpace(this.trackData.id)) {
			await PlaySongFromYouTube(this.trackData)
		} else {
			await PlaySongFromLibrary(this.trackData)
		}
		// The audio-player element will take care of toggling "is-playing" attribute on and off for both the previous and current song tiles
		this.ToggleLoadingMask(false)
	}

	disconnectedCallback() {
		super.disconnectedCallback()
	}
}

customElements.define("song-tile", SongTile)









