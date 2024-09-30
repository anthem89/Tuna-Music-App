import { TrackData } from "./track-data.js"
import { PlaySongFromLibrary, PlaySongFromYouTube } from "../app-functions.js"
import { isNullOrWhiteSpace } from "../utils.js"

export class SongTile extends HTMLElement {
	/** @param {TrackData} trackData */
	constructor(trackData) {
		super()

		this.trackData = trackData
		this.albumImage
		this.isLoading = false
	}

	connectedCallback() {
		const defaultAlbumImage = "../../assets/img/no-album-art.png"
		const html = `
			<div class="song-tile-image">
				<img src="${this.trackData.album_art || defaultAlbumImage}">
				<div class="loading-spinner">
					<div class="spinner-border" role="status"></div>
				</div>
			</div>
			<div class="song-tile-text-div">
				<span class="song-title">${this.trackData.title || "Unknown"}</span>
				<span class="artist-name">${this.trackData.artist || "Unknown"}</span>
			</div>
			<i class="btn-open-mobile-context-menu bi bi-three-dots-vertical"></i>
		`
		this.innerHTML = DOMPurify.sanitize(html)
		this.albumImage = this.querySelector("img")
		this.albumImage.onerror = () => {
			this.albumImage.src = defaultAlbumImage
		}
	}

	ToggleLoadingMask(isLoading) {
		this.classList.toggle("loading", isLoading)
		this.isLoading = isLoading
	}

	async PlaySong() {
		if (this.isLoading === true) { return }
		this.ToggleLoadingMask(true)
		if (isNullOrWhiteSpace(this.trackData.id)) {
			await PlaySongFromYouTube(this.trackData.video_id)
		} else {
			await PlaySongFromLibrary(this.trackData.id)
		}
		this.ToggleLoadingMask(false)
	}

	disconnectedCallback() {
		this.albumImage.onerror = null
	}
}

customElements.define("song-tile", SongTile)









