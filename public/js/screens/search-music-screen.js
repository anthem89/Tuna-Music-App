import { InjectGlobalStylesheets, secondsToTimestamp } from "../utils.js"
import { AutocompleteInput } from "../components/autocomplete-input.js"
import { DataTable, DataTableHeader } from "../components/data-table.js"
import { AudioPlayer } from "../components/audio-player.js"
import { TrackData } from "../components/track-data.js"

export class SearchMusicScreen extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: "open" })
	}

	connectedCallback() {
		this.shadowRoot.innerHTML = `
			<link href="./js/screens/search-music-screen.css" rel="stylesheet" type="text/css">

			<div class="d-flex">
				<autocomplete-input></autocomplete-input>
				<button id="search-button">Submit</button>
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
	}

	#initializeSearchAutoComplete() {
		this.autocompleteInput.InputCallback = async (query) => {
			const res = await fetch("./search-autocomplete?query=" + query)
			const resJson = await res.json()
			return resJson
		}
	}

	#performSearch() {
		return new Promise(async (resolve, reject) => {
			try {
				const query = this.autocompleteInput.inputElement.value
				const res = await fetch("/search?query=" + query)
				const resJson = await res.json()

				const columnHeaders = ["Actions", "Album Artwork", "Artist", "Song Title", "Album Name", "Duration"].map((header) => new DataTableHeader({ name: header, resizeable: false, sortable: false }))

				const tableData = []
				this.resultsData = []

				if (Array.isArray(resJson)) {
					resJson.forEach((result, index) => {
						const actionsHtml = `<div data-video-id="${result["videoId"]}" data-index="${index}"><a class="link-underline btn-play">Play</a><span> | </span><a class="link-underline btn-add">Add</a></div>`
						let thumbnail = result["thumbnails"]
						thumbnail = (Array.isArray(thumbnail) ? (thumbnail[thumbnail.length - 1]?.["url"] || "") : "")
						const albumArtwork = `<img class="album-artwork" src="${thumbnail}">`
						const artistName = result["artist"]["name"]
						const songTitle = result["name"]
						const albumName = result["album"]["name"]
						const duration = result["duration"]

						this.resultsData.push(new TrackData({
							album_art: thumbnail,
							artist: artistName,
							title: songTitle,
							album: albumName,
							duration: duration
						}))

						tableData.push([actionsHtml, albumArtwork, artistName, songTitle, albumName, secondsToTimestamp(duration)])
					})
				}

				const searchResultsTable = new DataTable(columnHeaders, tableData)
				this.dataTableWrapper.innerHTML = ""
				this.dataTableWrapper.appendChild(searchResultsTable)

			} catch (e) {

			}
		})
	}

	async #rowAction(e) {
		const target = e.target.closest("a")
		const searchResultRow = target.parentElement
		let libraryUuid
		if (target != null) {
			if (target.classList.contains("btn-add")) {
				// Download the song
				const videoId = searchResultRow.dataset["videoId"]
				const res = await fetch("/download-song?videoId=" + videoId)
				const resJson = await res.json()
				libraryUuid = resJson["uuid"]
				const fileSize = resJson["fileSize"]
				const fileFormat = resJson["fileFormat"]
				searchResultRow.setAttribute("data-library-uuid", libraryUuid)

				// Save the song to the music library
				/** @type {TrackData} */
				const trackData = this.resultsData[searchResultRow.dataset["index"]]
				trackData.id = libraryUuid
				trackData.video_id = videoId
				trackData.file_size = fileSize
				trackData.file_format = fileFormat
				trackData.date_downloaded = Date.now()
				const reqHeader = {"Content-Type": "application/json" }
				fetch("/user-library/save-song", { method: "POST", body: JSON.stringify(trackData), headers: reqHeader })

			} else if (target.classList.contains("btn-play")) {
				libraryUuid = searchResultRow.dataset["libraryUuid"]
				/** @type {AudioPlayer} */
				const audioPlayer = this.shadowRoot.ownerDocument.querySelector("audio-player")
				audioPlayer.SetSource(libraryUuid)
				audioPlayer.audioElement.play()
			}
		}
	}

	disconnectedCallback() {
		this.searchButton.onclick = null
		this.dataTableWrapper.onclick = null
	}
}

customElements.define("search-music-screen", SearchMusicScreen)









