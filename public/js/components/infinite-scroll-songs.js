import { TrackData } from "./data-models.js"
import { SongTile } from "./song-tile.js"
import { secondsToTimestamp, RemoveAllChildren } from "../utils.js"
import { SessionExpired, AlertBanner } from "../index.js"
import { SongActionsMenu } from "./song-actions-menu.js"
dayjs.extend(dayjs_plugin_relativeTime)

export class InfiniteScrollSongs extends HTMLElement {
	constructor(apiEndpoint, parentPlaylistId) {
		super()
		this.apiEndpoint = apiEndpoint
		this.batchSize = 25 // The number of items to show using scroll virtualization
		this.rowHeight = 71.6 // Must match the height in px of each tr element
		this.tbodyIndex = 0
		this.scrollEnd = false
		this.parentPlaylistId = parentPlaylistId

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
						<th>Plays</th>
						<th>Last Played</th>
						<th>Date Added</th>
					</tr>
				</thead>
			</table>
		`
	}

	async connectedCallback() {
		this.intersectionObserver = new IntersectionObserver((entries, observer) => { this.#intersectionObserverCallback(entries, observer) }, {
			root: null, // default to the viewport
			rootMargin: "50px 0px", // apply 50px margin to each observed entry's intersection area (ie: an intersection will trigger when the entry is within 50px of the visible area)
			threshold: 0.01 // 0% of the target entry needs to be visible before triggering an intersection
		})

		this.mediaListTable = this.querySelector(".media-list-table")
		this.songActionsMenu = new SongActionsMenu(this.parentPlaylistId, this.mediaListTable)

		this.onclick = (e) => { this.#handleRowClick(e) }
		await this.#fetchData()
		this.#createTableSection(Math.min(this.trackDataArray.length, this.batchSize))
	}

	/** @type {IntersectionObserverCallback} */
	#intersectionObserverCallback(entries, observer) {
		entries.forEach(async (entry) => {
			if (entry.isIntersecting) {
				/** @type {HTMLTableSectionElement} */
				const tbody = entry.target
				if (tbody.childElementCount === 0) {
					const startIndex = parseInt(tbody.dataset.startIndex)
					this.#populateTableSection(tbody, this.trackDataArray.slice(startIndex, startIndex + this.batchSize))
				}
				// If user has scrolled to last batch in the list, then create a new tbody element
				if (tbody === this.mediaListTable.lastElementChild && this.scrollEnd === false) {
					const remainingRows = this.trackDataArray.length - this.batchSize - parseInt(tbody.dataset.startIndex)
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
					<td class="text-center"><div class="action-link-container"><a class="link-underline action-link" name="btn-actions">Actions</a></div></td>
					<td name="album"><span class="clampTwoLines">${DOMPurify.sanitize(trackData.album)}</span></td>
					<td name="duration" class="text-center">${secondsToTimestamp(trackData.duration)}</td>
					<td name="number_of_plays" class="text-center">${trackData.number_of_plays || "0"}</td>
					<td name="date_last_played"><span class="text-center clampTwoLines">${trackData.date_last_played ? dayjs(trackData.date_last_played + "Z").fromNow() : "N/A"}</span></td>
					<td name="date_downloaded"><span class="text-center clampTwoLines">${trackData.date_downloaded ? dayjs(trackData.date_downloaded + "Z").fromNow() : "N/A"}</span></td>
				</tr>
			`
			rowsHtml += rowTemplate
		}
		tbody.style.height = (trackDataArray.length * this.rowHeight) + "px"
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
		this.mediaListTable.insertAdjacentElement("beforeend", tbody)
		this.intersectionObserver.observe(tbody)
		this.tbodyIndex += this.batchSize
	}

	/** @param {TrackData[]} targetTrackArray */
	RemoveTracks(targetTrackArray) {
		const targetIds = new Set()
		const targetVideoIds = new Set()
		targetTrackArray.forEach(targetTrack => {
			if (targetTrack.id != null) {
				targetIds.add(targetTrack.id)
			} else if (targetTrack.video_id != null) {
				targetVideoIds.add(targetTrack.video_id)
			}
		})
		const originalLength = this.trackDataArray.length
		this.trackDataArray = this.trackDataArray.filter(track => {
			if (track.id != null && targetIds.has(track.id)) {
				return false // Remove tracks with matching id
			}
			if (track.video_id != null && targetVideoIds.has(track.video_id)) {
				return false // Remove tracks with matching video_id
			}
			return true // Keep the track if no match is found
		})
		// Only update observer and table if any tracks were removed
		if (this.trackDataArray.length < originalLength) {
			this.intersectionObserver.disconnect()
			this.mediaListTable.querySelectorAll("tbody").forEach((tbody) => {
				RemoveAllChildren(tbody)
				this.intersectionObserver.observe(tbody)
			})
		}
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
				this.songActionsMenu.ForceShow(pos.x, pos.y + pos.height, pos.height, false, true, [songTile.trackData], songTile, true)
			}
		} else {
			if (e.target.closest(".btn-open-mobile-context-menu") != null) {
				// User clicked on the "More options" button
				this.songActionsMenu.ForceShow(0, 0, 0, false, false, [songTile.trackData], songTile, true)
			} else {
				songTile.Play(this.parentPlaylistId)
			}
		}
	}

	async Reset(apiEndpoint = null) {
		this.intersectionObserver.disconnect()
		this.trackDataArray = []
		this.querySelectorAll("tbody").forEach((tbody) => { tbody.remove() })
		this.apiEndpoint = apiEndpoint || this.apiEndpoint
		await this.#fetchData()
		this.#createTableSection(Math.min(this.trackDataArray.length, this.batchSize))
	}

	disconnectedCallback() {
		this.onclick = null
		this.intersectionObserver.disconnect()
		this.intersectionObserver = null
		this.songActionsMenu.Dispose()
		this.songActionsMenu = null
		this.mediaListTable = null
		this.parentPlaylistId = null
		this.trackDataArray = null
		this.mediaListTable = null
	}
}

customElements.define("infinite-scroll-songs", InfiniteScrollSongs)