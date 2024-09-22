export class DataTable extends HTMLElement {
	/**
	 * @param {String[]} headers
	 * @param {Array[]} dataArray
	 */
	constructor(headers, dataArray) {
		super()

		this.headers = headers
		this.dataArray = dataArray
	}

	connectedCallback() {
		const table = document.createElement("table")
		const thead = document.createElement("thead")
		const headerRow = document.createElement("tr")

		this.headers.forEach((header) => {
			const th = document.createElement("th")
			th.innerText = header
			headerRow.appendChild(th)
		})

		thead.appendChild(headerRow)
		table.appendChild(thead)

		const tbody = document.createElement("tbody")
		this.dataArray.forEach((rowData) => {
			const row = document.createElement("tr")
			rowData.forEach((cellData) => {
				const cell = document.createElement("td")
				if (cellData instanceof HTMLElement) {
					cell.appendChild(cellData)
				} else {
					cell.innerText = cellData
				}
				row.appendChild(cell)
			})
			tbody.appendChild(row)
		})
		table.appendChild(tbody)

		this.insertAdjacentElement("afterbegin", table)
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
					if (cellData instanceof HTMLElement) {
						td.appendChild(cellData)
					} else {
						td.innerText = cellData
					}
					tr.appendChild(td)
				})
				if (i >= existingRows.length) {
					// Add new row if there are more new rows than existing rows
					existingTable.appendChild(tr)
				} else {
					// Update existing row
					existingRows[i].innerHTML = tr.innerHTML
				}
			}
		}
	}

	disconnectedCallback() {

	}
}

window.customElements.define("data-table", DataTable)
