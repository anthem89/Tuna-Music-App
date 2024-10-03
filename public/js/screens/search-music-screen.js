import { InjectGlobalStylesheets, secondsToTimestamp, RemoveAllChildren, CreateElementFromHTML, isNullOrWhiteSpace } from "../utils.js"
import { AutocompleteInput } from "../components/autocomplete-input.js"
import { DataTable } from "../components/data-table.js"
import { TrackData } from "../components/data-models.js"
import { SongTile } from "../components/song-tile.js"
import { AlertBanner, SessionExpired, AudioPlayerElement } from "../index.js"
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

		this.tableWrapper = this.shadowRoot.querySelector("#search-results-table-wrapper")
		this.searchButton = this.shadowRoot.querySelector("#search-button")
		this.searchButton.onclick = () => { this.#performSearch() }

		/** @type {AutocompleteInput} */
		this.autocompleteInput = this.shadowRoot.querySelector("autocomplete-input")
		this.#initializeSearchAutoComplete()

		this.tableWrapper.onclick = (e) => {
			this.#handleRowClick(e)
		}
		this.resultsData = null

		this.songActionsMenu = new SongActionsMenu(null)
		this.songActionsMenu.SetVisibleOptions({ addToPlaylist: false, removeFromPlaylist: false, removeFromLibrary: false, downloadToDevice: false, editSongAttributes: false })
	}

	#initializeSearchAutoComplete() {
		this.autocompleteInput.InputCallback = async (query) => {
			const res = await fetch("./search-autocomplete?query=" + query)
			if (res.redirected) { SessionExpired() }
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
				if (res.redirected) {
					SessionExpired()
				} else if (res.status >= 400) {
					throw new Error(res.statusText)
				}
				const resJson = await res.json()

				const columnHeaders = ["Song", "", "Actions", "Album Name", "Duration"]

				const tableData = []
				this.resultsData = []

				if (Array.isArray(resJson)) {
					resJson.forEach((result) => {
						const actionsHtml = /*html*/`<div class="action-link-container"><a class="link-underline action-link" name="btn-actions">Actions</a></div>`
						let albumArtwork = result["thumbnails"]
						albumArtwork = (Array.isArray(albumArtwork) ? (albumArtwork[albumArtwork.length - 1]?.["url"] || "") : "")
						const libraryUuid = result["libraryUuid"]
						const alreadyDownloadedCheckmark = /*html*/`<i class="bi bi-check-circle-fill already-downloaded-checkmark ${libraryUuid == null ? "hidden" : ""}"></i>`
						const videoId = result["videoId"]
						const artistName = result["artist"]?.["name"] || "Unknown"
						const artistId = result["artist"]?.["artistId"]
						const songTitle = result["name"] || "Unknown"
						const albumName = result["album"]?.["name"] || "Unknown"
						const albumId = result["album"]?.["albumId"]
						const duration = result["duration"]
						if (isNullOrWhiteSpace(videoId)) { return }

						const trackData = new TrackData({
							id: libraryUuid,
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
						const albumNameHtml = `<span class="clampTwoLines">${albumName}</span>`
						tableData.push([songTile, CreateElementFromHTML(alreadyDownloadedCheckmark), CreateElementFromHTML(actionsHtml, false), CreateElementFromHTML(albumNameHtml, true), secondsToTimestamp(duration)])
					})
				}

				const searchResultsTable = new DataTable(columnHeaders, tableData)
				searchResultsTable.classList.add("media-list-table")
				RemoveAllChildren(this.tableWrapper)
				this.tableWrapper.appendChild(searchResultsTable)
				resolve()
			} catch (e) {
				reject(e)
				AlertBanner.Toggle(true, true, "Error performing search", 7000, AlertBanner.bannerColors.error)
			}
		})
	}

	async #handleRowClick(e) {
		const actionLink = e.target.closest("a")
		const tableRow = e.target.closest("tr")
		/** @type {SongTile} */
		const songTile = tableRow?.querySelector("song-tile")
		if (songTile == null) { return }
		if (actionLink != null) {
			const pos = actionLink.getBoundingClientRect()
			this.songActionsMenu.ForceShow(pos.x, pos.y + pos.height, pos.height, false, true, songTile)
		} else {
			if (e.target.closest(".btn-open-mobile-context-menu") != null) {
				// User clicked on the "More options" button
				this.songActionsMenu.ForceShow(0, 0, 0, false, false, songTile)
			} else {
				// User clicked on a row to play a song without downloading it to the library
				songTile.Play(null)
			}
		}
	}

	disconnectedCallback() {
		this.searchButton.onclick = null
		this.tableWrapper.onclick = null
		this.autocompleteInput.suggestionsElement.onclick = null
		this.autocompleteInput.inputElement.onkeydown = null
	}
}

customElements.define("search-music-screen", SearchMusicScreen)









