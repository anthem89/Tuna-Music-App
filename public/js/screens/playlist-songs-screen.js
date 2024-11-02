import { InjectGlobalStylesheets } from "../utils.js"
import { InfiniteScrollSongs } from "../components/infinite-scroll-songs.js"
import { PlaylistData } from "../components/data-models.js"

export class PlaylistSongsScreen extends HTMLElement {
	/** @param {PlaylistData} playlistData */
	constructor(playlistData) {
		super()
		this.attachShadow({ mode: "open" })
		this.playlistData = playlistData
	}

	async connectedCallback() {
		this.shadowRoot.innerHTML = `
			<link href="./js/screens/playlist-songs-screen.css" rel="stylesheet" type="text/css">

			<div id="playlist-songs-table-wrapper"></div>
		`
		InjectGlobalStylesheets(this)

		this.tableWrapper = this.shadowRoot.querySelector("#playlist-songs-table-wrapper")
		const songList = new InfiniteScrollSongs("/playlists/playlist-songs?playlistId=" + this.playlistData.id, this.playlistData.id)
		this.tableWrapper.appendChild(songList)

		this.shadowRoot.ownerDocument.querySelector("#module-title").textContent = this.playlistData.title || "Untitled Playlist"
	}

	disconnectedCallback() {
		this.tableWrapper = null
	}
}

customElements.define("playlist-songs-screen", PlaylistSongsScreen)
