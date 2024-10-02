import { TrackData } from "./data-models.js"
import { SongTile } from "./song-tile.js"
import { secondsToTimestamp, RemoveAllChildren } from "../utils.js"
import { SessionExpired, AlertBanner } from "../index.js"
import { SongActionsMenu } from "./song-actions-menu.js"

// This component incrementally fetches data as the users approaches the bottom of the scroll area
// It also implements DOM virtualization to dramatically optimize scroll performance by removing DOM elements as they go off screen, and re-creating them as they approach the visislbe scroll area

export class InfiniteScrollSongs extends HTMLElement {
	constructor(apiEndpoint) {
		super()

		this.songActionsMenu = new SongActionsMenu()

		this.apiEndpoint = apiEndpoint
		this.batchSize = 25 // The number of items to fetch per data request
		this.skip = 0
		this.rowHeight = 62 // Must match the height in px of each tr element
		this.endOfData = false

		/** @type {TrackData[]} */
		this.tableData = []

		this.innerHTML = `
			<table class="media-list-table">
				<thead>
					<tr>
						<th>Song</th>
						<th>Actions</th>
						<th>Album Name</th>
						<th>Duration</th>
					</tr>
				</thead>
			</table>
		`
	}

	connectedCallback() {
		this.intersectionObserver = new IntersectionObserver((entries, observer) => { this.#domVirtualization(entries, observer) }, {
			root: null, // default to the viewport
			rootMargin: "50px", // apply 50px margin to each observed entry's intersection area (ie: an intersection will trigger when the entry is within 50px of the visible area)
			threshold: 0 // 0% of the target entry needs to be visible before triggering an intersection
		})

		this.onclick = (e) => { this.#handleRowClick(e) }
		this.#fetchData()
	}

	/** @type {IntersectionObserverCallback} */
	#domVirtualization(entries, observer) {
		entries.forEach(async (entry, index) => {
			if (entry.isIntersecting) {
				/** @type {HTMLTableSectionElement} */
				const tbody = entry.target
				if (tbody.childElementCount === 0) {
					const startIndex = parseInt(tbody.dataset.startIndex)
					this.#populateTableSection(tbody, this.tableData.slice(startIndex, startIndex + this.batchSize))
				}
				// If user has scrolled to last batch in the list, then fetch more data
				if (index === entries.length - 1) {
					await this.#fetchData()
				}
			} else {
				// Remove all elements from the tbody if it is off screen
				RemoveAllChildren(entry.target)
			}
		})
	}

	/**
	 * @param {HTMLTableSectionElement} tbody
	 * @param {TrackData[]} trackDataArray
	 */
	#populateTableSection(tbody, trackDataArray) {
		let rowsHtml = ""
		for (let trackData of trackDataArray) {
			const rowTemplate = `
				<tr>
					<td></td>
					<td><div class="action-link-container"><a class="link-underline action-link" name="btn-actions">Actions</a></div></td>
					<td><span class="clampTwoLines">${DOMPurify.sanitize(trackData.album)}</span></td>
					<td>${secondsToTimestamp(trackData.duration)}</td>
				</tr>
			`
			rowsHtml += rowTemplate
		}
		tbody.insertAdjacentHTML("afterbegin", rowsHtml)
		trackDataArray.forEach((trackData, index) => {
			tbody.rows[index].cells[0].appendChild(new SongTile(trackData))
		})
	}

	async #fetchData() {
		return new Promise(async (resolve, reject) => {
			try {
				if (this.endOfData === true) {
					resolve()
					return
				}

				let queryParamsString = ""
				const queryString = this.apiEndpoint.split("?")[1]
				if (queryString) {
					const queryParams = new URLSearchParams(queryString)
					for (const [key, value] of queryParams) {
						if (["top", "skip"].includes(key)) { continue }
						queryParamsString += "&" + key + "=" + value
					}
				}
				const res = await fetch(this.apiEndpoint.split("?")[0] + "?top=" + this.batchSize + "&skip=" + this.skip + queryParamsString, { method: "GET" })
				if (res.redirected) {
					SessionExpired()
					reject()
				} else if (res.status >= 400) {
					throw new Error(res.statusText)
				}
				const resJson = await res.json()
				if (resJson.length === 0) {
					this.endOfData = true
					resolve()
					return
				}

				const trackDataArray = resJson.map((item) => new TrackData(item))
				this.tableData.push(...trackDataArray)

				const tbody = document.createElement("tbody")
				tbody.style.height = (this.rowHeight * resJson.length) + "px"
				tbody.dataset.startIndex = this.skip
				this.querySelector("table").insertAdjacentElement("beforeend", tbody)
				this.intersectionObserver.observe(tbody)

				this.skip += resJson.length

				resolve()
			} catch (e) {
				AlertBanner.Toggle(true, true, "Error loading songs", 7000, AlertBanner.bannerColors.error)
				reject(e)
			}
		})
	}

	async #handleRowClick(e) {
		const targetRow = e.target.closest("tr")
		/** @type {SongTile} */
		const songTile = targetRow?.querySelector("song-tile")
		if (songTile == null) { return }
		/** @type {HTMLAnchorElement} */
		const actionLink = e.target.closest(".action-link")
		if (actionLink != null) {
			if (actionLink.getAttribute("name") === "btn-actions") {
				const pos = actionLink.getBoundingClientRect()
				this.songActionsMenu.ForceShow(pos.x, pos.y + pos.height, pos.height, false, true, songTile)
			}
		} else {
			if (e.target.closest(".btn-open-mobile-context-menu") != null) {
				// User clicked on the "More options" button
				this.songActionsMenu.ForceShow(0, 0, 0, false, false, songTile)
			} else {
				songTile.PlaySong()
			}
		}
	}

	Reset(apiEndpoint = null) {
		this.intersectionObserver.disconnect()
		this.tableData = []
		this.querySelectorAll("tbody").forEach((tbody) => { tbody.remove() })
		this.skip = 0
		this.apiEndpoint = apiEndpoint || this.apiEndpoint
		this.endOfData = false
		this.#fetchData()
	}

	disconnectedCallback() {
		this.onclick = null
		this.intersectionObserver.disconnect()
	}
}

customElements.define("infinite-scroll-songs", InfiniteScrollSongs)