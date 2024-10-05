import { AudioPlayerElement } from "../index.js"

export class MediaTile extends HTMLElement {
	constructor(image, primaryText, secondaryText) {
		super()

		const html = `
			<div class="media-tile-image">
				<img src="${image || "../../assets/img/no-album-art.png"}">
				<div class="loading-spinner">
					<div class="spinner-border" role="status"></div>
				</div>
			</div>
			<div class="media-tile-text-div">
				<span class="media-tile-primary-text">${primaryText}</span>
				<span class="media-tile-secondary-text">${secondaryText}</span>
			</div>
			<div class="mobile-end-container">
				<i class="btn-open-mobile-context-menu bi bi-three-dots-vertical"></i>
			</div>
		`
		this.innerHTML = DOMPurify.sanitize(html)

		this.classList.add("media-tile")
		this.imageElement = this.querySelector("img")
		this.imageElement.onerror = () => {
			this.imageElement.src = "../../assets/img/no-album-art.png"
		}
		this.primaryTextElement = this.querySelector(".media-tile-primary-text")
		this.secondaryTextElement = this.querySelector(".media-tile-secondary-text")

		this.isBuffering = false
		this.isDownloading = false
	}

	connectedCallback() {
		// When this tile loads, test if its video_id or id match the currently playing song, then set the "is-playing" attribute accordingly
		this.isCurrentlyPlaying()
	}

	isCurrentlyPlaying() {
		let isCurrentlyPlaying = false
		if (AudioPlayerElement.isPlaying || AudioPlayerElement.isPaused) {
			if (this.trackData != null) {
				if (this.trackData["id"] == null) {
					isCurrentlyPlaying = this.trackData["video_id"] != null && AudioPlayerElement.currentTrack?.["video_id"] === this.trackData["video_id"]
				} else {
					isCurrentlyPlaying = this.trackData["id"] != null && AudioPlayerElement.currentTrack?.["id"] === this.trackData["id"]
				}
			} else if (this.playlistData != null) {
				isCurrentlyPlaying = AudioPlayerElement.currentPlaylistId === this.playlistData.id
			}
		}
		this.classList.toggle("is-playing", isCurrentlyPlaying)
		return isCurrentlyPlaying
	}

	ToggleBufferingSpinner(isBuffering) {
		this.classList.toggle("is-buffering", isBuffering)
		this.isBuffering = isBuffering
	}

	ToggleDownloadingSpinner(isDownloading) {
		this.classList.toggle("is-downloading", isDownloading)
		this.isDownloading = isDownloading
	}

	disconnectedCallback() {
		this.imageElement.onerror = null
	}
}







