import { InjectGlobalStylesheets, secondsToTimestamp, RemoveAllChildren, CreateElementFromHTML, isNullOrWhiteSpace } from "../utils.js"
import { AutocompleteInput } from "../components/autocomplete-input.js"
import { DataTable } from "../components/data-table.js"
import { TrackData } from "../components/track-data.js"
import { SongTile } from "../components/song-tile.js"
import { PlaySongFromYouTube } from "../app-functions.js"
import { AlertBanner } from "../index.js"
import { SongActionsMenu } from "../components/song-actions-menu.js"

export class SearchMusicScreen extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: "open" })
	}

	connectedCallback() {
		this.shadowRoot.innerHTML = `
			<link href="./js/screens/search-music-screen.css" rel="stylesheet" type="text/css">

			<div id="search-input-wrapper">
				<autocomplete-input></autocomplete-input>
				<button id="search-button"><i class="bi bi-search"></i></button>
			</div>
			
			<div id="search-results-table-wrapper">

			</div>
		`
		InjectGlobalStylesheets(this)

		this.dataTableWrapper = this.shadowRoot.querySelector("#search-results-table-wrapper")
		this.searchButton = this.shadowRoot.querySelector("#search-button")
		this.searchButton.onclick = () => { this.#performSearch() }

		/** @type {AutocompleteInput} */
		this.autocompleteInput = this.shadowRoot.querySelector("autocomplete-input")
		this.#initializeSearchAutoComplete()

		this.dataTableWrapper.onclick = (e) => {
			this.#rowAction(e)
		}
		this.resultsData = null

		this.songActionsMenu = new SongActionsMenu()
	}

	#initializeSearchAutoComplete() {
		this.autocompleteInput.InputCallback = async (query) => {
			const res = await fetch("./search-autocomplete?query=" + query)
			const resJson = await res.json()
			return resJson
		}
		this.autocompleteInput.suggestionsElement.onclick = (e) => {
			const clickedSuggestion = e.target.closest(".autocomplete-suggestion")
			const query = clickedSuggestion?.textContent.trim()
			this.autocompleteInput.closeSuggestionDropdown()
			if (isNullOrWhiteSpace(query) == false) {
				this.autocompleteInput.inputElement.value = query
				this.#performSearch(query)
			}
		}
		this.autocompleteInput.inputElement.onkeydown = (e) => {
			if (e.key === "Enter") {
				setTimeout(() => {
					this.autocompleteInput.closeSuggestionDropdown()
				}, 100)
				this.#performSearch()
			}
		}
	}

	#performSearch(query) {
		return new Promise(async (resolve, reject) => {
			try {
				if (query == null) {
					query = this.autocompleteInput.inputElement.value.trim()
				}
				const res = await fetch("/search?query=" + query)
				if (res.status >= 400) { throw new Error(res.statusText) }
				const resJson = await res.json()

				const columnHeaders = ["Song", "Actions", "Album Name", "Duration"]

				const tableData = []
				this.resultsData = []

				if (Array.isArray(resJson)) {
					resJson.forEach((result, index) => {
						const actionsHtml = `<div class="action-link-container"><a class="link-underline action-link" name="btn-actions">Actions</a></div>`
						let albumArtwork = result["thumbnails"]
						albumArtwork = (Array.isArray(albumArtwork) ? (albumArtwork[albumArtwork.length - 1]?.["url"] || "") : "")
						const videoId = result["videoId"]
						const artistName = result["artist"]["name"]
						const artistId = result["artist"]["id"]
						const songTitle = result["name"]
						const albumName = result["album"]["name"]
						const albumId = result["album"]["id"]
						const duration = result["duration"]

						const trackData = new TrackData({
							video_id: videoId,
							album_art: albumArtwork,
							artist: artistName,
							artist_id: artistId,
							title: songTitle,
							album: albumName,
							album_id: albumId,
							duration: duration
						})
						this.resultsData.push(trackData)
						const songTile = new SongTile(trackData)
						songTile.setAttribute("data-video-id", result["videoId"])
						tableData.push([songTile, CreateElementFromHTML(actionsHtml), albumName, secondsToTimestamp(duration)])
					})
				}

				const searchResultsTable = new DataTable(columnHeaders, tableData)
				searchResultsTable.classList.add("song-list-table")
				RemoveAllChildren(this.dataTableWrapper)
				this.dataTableWrapper.appendChild(searchResultsTable)

			} catch (e) {
				AlertBanner.Toggle(true, true, "Error performing search", 7000, AlertBanner.bannerColors.error)
			}
		})
	}

	async #rowAction(e) {
		const actionLink = e.target.closest("a")
		const searchResultRow = e.target.closest("tr")
		/** @type {SongTile} */
		const songTile = searchResultRow?.querySelector("song-tile")
		if (actionLink != null) {
			const pos = actionLink.getBoundingClientRect()
			this.songActionsMenu.ForceShow(pos.x, pos.y + pos.height, pos.height, false, true, songTile)
		} else if (songTile != null) {
			if (e.target.closest(".btn-open-mobile-context-menu") != null) {
				// User clicked on the "More options" button
				this.songActionsMenu.ForceShow(0, 0, 0, false, false, songTile)
			} else {
				// User clicked on a row to play a song without downloading it to the library
				const videoId = songTile?.dataset?.["videoId"]
				PlaySongFromYouTube(videoId)
			}
		}
	}

	disconnectedCallback() {
		this.searchButton.onclick = null
		this.dataTableWrapper.onclick = null
		this.autocompleteInput.inputElement.onkeydown = null
	}
}

customElements.define("search-music-screen", SearchMusicScreen)









