import { TrackData } from "./track-data.js"
import { SongTile } from "./song-tile.js"
import { secondsToTimestamp, RemoveAllChildren } from "../utils.js"
import { SessionExpired, AlertBanner } from "../index.js"

// This component incrementally fetches data as the users approaches the bottom of the scroll area
// It also implements DOM virtualization to dramatically optimize scroll performance by removing DOM elements as they go off screen, and re-creating them as they approach the visislbe scroll area

export class VirtualizedInfiniteScroll extends HTMLElement {
	constructor(apiEndpoint, filterField, filterValue, sortField, sortOrder) {
		super()

		this.apiEndpoint = apiEndpoint
		this.batchSize = 25 // The number of items to fetch per data request
		this.skip = 0

		this.rowHeight = 62 // Must match the height in px of each tr element
		this.filterField = filterField
		this.filterValue = filterValue
		this.sortField = sortField
		this.sortOrder = sortOrder || "desc"
		this.endOfData = false

		/** @type {TrackData[]} */
		this.tableData = []

		this.innerHTML = `
			<table class="song-list-table">
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
				let sortField = this.sortField != null ? ("&sort=" + this.sortField) : ""
				let sortOrder = this.sortOrder != null ? ("&order=" + this.sortOrder) : ""
				let filter = ""
				if (this.filterField != null && this.filterValue != null) {
					filter = "&filterField=" + this.filterField + "&filterValue=" + this.filterValue
				}
				const res = await fetch(this.apiEndpoint + "?top=" + this.batchSize + "&skip=" + this.skip + sortField + sortOrder + filter, { method: "GET" })
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

	Reset(apiEndpoint = null, filterField = null, filterValue = null, sortField = null, sortOrder = null) {
		this.intersectionObserver.disconnect()
		this.tableData = []
		this.querySelectorAll("tbody").forEach((tbody)=>{ tbody.remove() })
		this.skip = 0
		this.apiEndpoint = apiEndpoint || this.apiEndpoint
		this.filterField = filterField || this.filterField
		this.filterValue = filterValue || this.filterValue
		this.sortField = sortField || this.sortField
		this.sortOrder = sortOrder || this.sortOrder
		this.endOfData = false
		this.#fetchData()
	}

	disconnectedCallback() {
		this.intersectionObserver.disconnect()
	}
}

customElements.define("virtualized-infinite-scroll", VirtualizedInfiniteScroll)