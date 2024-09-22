import { TrackData } from "./track-data.js"

export class SongTile extends HTMLElement {
	/** @param {TrackData} trackData */
	constructor(trackData) {
		super()

		this.trackData = trackData
		this.albumImage
	}

	connectedCallback() {
		this.innerHTML = `
			<img src="${this.trackData.album_art}">
			<div class="song-tile-text-div">
				<span class="song-title">${this.trackData.title}</span>
				<span class="artist-name">${this.trackData.artist}</span>
			</div>
			<div>
				<i class="btn-open-mobile-context-menu bi bi-three-dots-vertical"></i>
			</div>
		`
		this.albumImage = this.querySelector("img")
		this.albumImage.onerror = () => {
			this.albumImage.src = "../../assets/img/no-album-art.png"
		}
	}

	disconnectedCallback() {

	}
}

customElements.define("song-tile", SongTile)









