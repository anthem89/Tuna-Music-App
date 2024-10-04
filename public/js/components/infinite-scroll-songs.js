import { TrackData } from "./data-models.js"
import { SongTile } from "./song-tile.js"
import { secondsToTimestamp, RemoveAllChildren } from "../utils.js"
import { SessionExpired, AlertBanner } from "../index.js"
import { SongActionsMenu } from "./song-actions-menu.js"

export class InfiniteScrollSongs extends HTMLElement {
	constructor(apiEndpoint, parentPlaylistId) {
		super()

		this.parentPlaylistId = parentPlaylistId
		this.songActionsMenu = new SongActionsMenu(parentPlaylistId)

		this.apiEndpoint = apiEndpoint
		this.batchSize = 25 // The number of items to show using scroll virtualization
		this.rowHeight = 66.8 // Must match the height in px of each tr element
		this.tbodyIndex = 0
		this.scrollEnd = false

		/** @type {TrackData[]} */
		this.trackDataArray = []

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

	async connectedCallback() {
		this.intersectionObserver = new IntersectionObserver((entries, observer) => { this.#domVirtualization(entries, observer) }, {
			root: null, // default to the viewport
			rootMargin: "50px", // apply 50px margin to each observed entry's intersection area (ie: an intersection will trigger when the entry is within 50px of the visible area)
			threshold: 0 // 0% of the target entry needs to be visible before triggering an intersection
		})

		this.table = this.querySelector("table")
		this.onclick = (e) => { this.#handleRowClick(e) }
		await this.#fetchData()
		this.#createTableSection(Math.min(this.trackDataArray.length, this.batchSize))
	}

	/** @type {IntersectionObserverCallback} */
	#domVirtualization(entries, observer) {
		entries.forEach(async (entry) => {
			if (entry.isIntersecting) {
				/** @type {HTMLTableSectionElement} */
				const tbody = entry.target
				if (tbody.childElementCount === 0) {
					const startIndex = parseInt(tbody.dataset.startIndex)
					this.#populateTableSection(tbody, this.trackDataArray.slice(startIndex, startIndex + this.batchSize))
				}
				// If user has scrolled to last batch in the list, then create a new tbody element
				if (tbody === this.table.lastElementChild && this.scrollEnd === false) {
					const remainingRows = this.trackDataArray.length - this.batchSize - tbody.dataset.startIndex
					if (remainingRows <= this.batchSize) {
						this.scrollEnd = true
					}
					this.#createTableSection(Math.min(remainingRows, this.batchSize))
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
		tbody.style.visibility = "hidden"
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
		tbody.style.visibility = null
	}

	#createTableSection(rowCount) {
		const tbody = document.createElement("tbody")
		tbody.dataset.startIndex = this.tbodyIndex
		tbody.style.height = (rowCount * this.rowHeight) + "px"
		this.table.insertAdjacentElement("beforeend", tbody)
		this.intersectionObserver.observe(tbody)
		this.tbodyIndex += this.batchSize
	}

	async #fetchData() {
		return new Promise(async (resolve, reject) => {
			try {
				const res = await fetch(this.apiEndpoint, { method: "GET" })
				if (res.redirected) {
					SessionExpired()
					reject()
				} else if (res.status >= 400) {
					throw new Error(res.statusText)
				}
				const resJson = await res.json()
				const trackDataArray = resJson.map((item) => new TrackData(item))
				this.trackDataArray.push(...trackDataArray)

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
				songTile.Play(this.parentPlaylistId)
			}
		}
	}

	Reset(apiEndpoint = null) {
		this.intersectionObserver.disconnect()
		this.trackDataArray = []
		this.querySelectorAll("tbody").forEach((tbody) => { tbody.remove() })
		this.apiEndpoint = apiEndpoint || this.apiEndpoint
		this.#fetchData()
	}

	disconnectedCallback() {
		this.onclick = null
		this.intersectionObserver.disconnect()
	}
}

customElements.define("infinite-scroll-songs", InfiniteScrollSongs)