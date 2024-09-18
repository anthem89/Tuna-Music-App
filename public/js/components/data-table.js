import DOMPurify from "../../vendor/dompurify-v3.1.5.es.mjs"

export class DataTable extends HTMLElement {
	/**
	 * @param {DataTableHeader[]} headers
	 * @param {Array[]} dataArray
	 */
	constructor(headers, dataArray) {
		super()

		this.headers = headers
		this.dataArray = dataArray

		this._boundMouseMove = null
		this._boundMouseUp = null
	}

	connectedCallback() {
		const table = document.createElement("table")
		table.classList.add("resizable-table")
		const thead = document.createElement("thead")
		const headerRow = document.createElement("tr")

		this.headers.forEach((header) => {
			const th = document.createElement("th")
			th.textContent = header.name
			if (header.resizeable === true) {
				const resizeHandle = document.createElement("div")
				resizeHandle.className = "resize-handle"
				th.appendChild(resizeHandle)
			}
			headerRow.appendChild(th)
		})

		thead.appendChild(headerRow)
		table.appendChild(thead)

		const tbody = document.createElement("tbody")
		this.dataArray.forEach((rowData) => {
			const row = document.createElement("tr")
			rowData.forEach((cellData) => {
				const cell = document.createElement("td")
				cell.innerHTML = cellData
				row.appendChild(cell)
			})
			tbody.appendChild(row)
		})
		table.appendChild(tbody)

		this.insertAdjacentHTML("afterbegin", DOMPurify.sanitize(table))

		// Add functionality to resize columns
		const thArray = this.querySelectorAll("th")
		this.headers.forEach((header, columnIndex) => {
			if (header.resizeable === true) {

				const onMouseMove = (e) => {
					const newWidth = startWidth + (e.pageX - startX)
					if (newWidth > 50 && newWidth < 750) {
						th.style.width = newWidth + "px"
						th.style.minWidth = newWidth + "px"

						const rows = this.querySelectorAll("tbody tr")
						rows.forEach(row => {
							row.children[columnIndex].style.maxWidth = newWidth + "px"
						})
					}
				}

				const th = thArray[columnIndex]
				const resizeHandle = th.querySelector(".resize-handle")
				let startX, startWidth

				this._boundMouseMove = onMouseMove
				this._boundMouseUp = () => {
					document.removeEventListener("mousemove", this._boundMouseMove)
					document.removeEventListener("mouseup", this._boundMouseUp)
				}

				resizeHandle.onmousedown = (e) => {
					startX = e.pageX
					startWidth = th.clientWidth
					document.addEventListener("mousemove", this._boundMouseMove)
					document.addEventListener("mouseup", this._boundMouseUp)
				}
			}
		})
	}

	/** @param {Array[]} dataArray */
	UpdateRowData(dataArray) {
		this.dataArray = dataArray
		/** @type {HTMLTableElement} */
		const existingTable = this.querySelector("table tbody")
		/** @type {HTMLTableRowElement[]} */
		const existingRows = Array.from(existingTable.rows)
		const newRowCount = dataArray.length
		const maxRows = Math.max(existingRows.length, newRowCount)
		for (let i = 0; i < maxRows; i++) {
			 if (i >= newRowCount) {
				// Remove extra row if there are more existing rows than new rows
				existingRows[i].remove()
			} else {
				const tr = document.createElement("tr")
				dataArray[i].forEach((cellData, colIndex) => {
					const td = document.createElement("td")
					td.innerHTML = cellData
					tr.appendChild(td)
				})
				if (i >= existingRows.length) {
					// Add new row if there are more new rows than existing rows
					existingTable.appendChild(tr)
				} else {
					// Update existing row
					existingRows[i].innerHTML = DOMPurify.sanitize(tr)
				}
				
			}
		}
	}

	disconnectedCallback() {
		this.querySelectorAll(".resize-handle").forEach((el) => { el.onmousedown = null })
		document.removeEventListener("mousemove", this._boundMouseMove)
		document.removeEventListener("mouseup", this._boundMouseUp)
	}
}

export class DataTableHeader {
	constructor({ name = "", resizeable = false, sortable = false, sortDirection = null } = {}) {
		this.name = name
		this.resizeable = resizeable
		this.sortable = sortable
		this.sortDirection = sortDirection
	}
}

window.customElements.define("data-table", DataTable)
