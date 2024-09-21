import { TrackData } from "./track-data.js"

export class SongTile extends HTMLElement {
	/** @param {TrackData} trackData */
	constructor(trackData) {
		super()

		this.trackData = trackData
	}

	connectedCallback() {
		this.innerHTML = `
			<img src="${this.trackData.album_art}">
			<div class="song-tile-text-div">
				<span class="song-title">${this.trackData.title}</span>
				<span class="artist-name">${this.trackData.artist}</span>
			</div>
		`
	}

	disconnectedCallback() {

	}
}

customElements.define("song-tile", SongTile)









