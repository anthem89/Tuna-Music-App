class VirtualTable extends HTMLElement {
	constructor() {
	  super()
  
	  // Create the shadow DOM
	  const shadow = this.attachShadow({ mode: 'open' })
  
	  // Create a container div for scrolling
	  this.container = document.createElement('div')
	  this.container.style.overflow = 'auto'
	  this.container.style.height = '400px' // Set height to control scroll area
	  this.container.style.position = 'relative'
  
	  // Create a spacer to hold the total height
	  this.spacer = document.createElement('div')
	  this.spacer.style.width = '1px'
	  this.spacer.style.height = '0px'
  
	  // Create a table
	  this.table = document.createElement('table')
	  this.table.style.position = 'absolute'
	  this.table.style.top = '0'
	  this.table.innerHTML = `
		<thead>
		  <tr>
			<th>Title</th>
			<th>Artist</th>
			<th>Album</th>
			<th>Duration</th>
		  </tr>
		</thead>
		<tbody></tbody>
	  `
	  this.tbody = this.table.querySelector('tbody')
  
	  // Append the spacer and the table to the container
	  this.container.appendChild(this.spacer)
	  this.container.appendChild(this.table)
	  shadow.appendChild(this.container)
  
	  // Setup properties for virtual scrolling
	  this.data = []
	  this.visibleRowsCount = 50 // Number of rows visible at a time
	  this.rowHeight = 26 // Assume each row is 26px in height
	  this.bufferRows = 5 // Buffer rows to render beyond the visible area
	  this.totalRows = 0
	  this.startRow = 0 // The first visible row index
	  this.isLoading = false // To prevent multiple loading at the same time
  
	  // Define threshold for fetching more data (number of rows before reaching the bottom)
	  this.rowsThreshold = 5 // Fetch data when within 5 rows from the bottom
  
	  // Add scroll listener
	  this.container.addEventListener('scroll', () => this.onScroll())
  
	  // Handle initial load of data
	  this.loadMoreData()
	}
  
	// Method to load more data
	async loadMoreData() {
	  if (this.isLoading) return
	  this.isLoading = true
  
	  const newData = await this.fetchData(this.totalRows, 50) // Fetch 50 new rows
  
	  // Append new data
	  this.data = this.data.concat(newData)
	  this.totalRows = this.data.length
  
	  // Update the spacer height to reflect total rows
	  this.spacer.style.height = `${this.totalRows * this.rowHeight}px`
  
	  this.isLoading = false
	  this.renderVisibleRows()
	}
  
	// Simulate an API call to fetch data
	async fetchData(skip, top) {
	  // Simulated data (replace this with an API call)
	  return Array.from({ length: top }, (_, i) => ({
		title: `Song ${skip + i + 1}`,
		artist: `Artist ${skip + i + 1}`,
		album: `Album ${skip + i + 1}`,
		duration: `${(Math.random() * 4 + 1).toFixed(2)} mins`
	  }))
	}
  
	// Handle scroll events
	async onScroll() {
	  const scrollTop = this.container.scrollTop
	  const containerHeight = this.container.offsetHeight
	  const firstVisibleRow = Math.floor(scrollTop / this.rowHeight)
  
	  // If the first visible row has changed, update the view
	  if (firstVisibleRow !== this.startRow) {
		this.startRow = firstVisibleRow
		this.renderVisibleRows()
	  }
  
	  // Calculate how many rows are left to scroll before hitting the bottom
	  const rowsLeftToScroll = Math.floor(((this.totalRows * this.rowHeight) - (scrollTop + containerHeight)) / this.rowHeight)
  
	  // If the user is within `rowsThreshold` rows of the end, load more data
	  if (rowsLeftToScroll <= this.rowsThreshold && !this.isLoading) {
		await this.loadMoreData()
	  }
	}
  
	// Method to render only visible rows
	renderVisibleRows() {
	  const start = Math.max(0, this.startRow - this.bufferRows)
	  const end = Math.min(this.totalRows, this.startRow + this.visibleRowsCount + this.bufferRows)
  
	  // Clear existing rows
	  this.tbody.innerHTML = ''
  
	  // Render only visible and buffer rows
	  for (let i = start; i < end; i++) {
		const item = this.data[i]
  
		const row = document.createElement('tr')
		row.innerHTML = `
		  <td>${item.title}</td>
		  <td>${item.artist}</td>
		  <td>${item.album}</td>
		  <td>${item.duration}</td>
		`
		this.tbody.appendChild(row)
	  }
  
	  // Adjust the table position to create the virtual scroll illusion
	  this.table.style.transform = `translateY(${this.startRow * this.rowHeight}px)`
	}
  }
  
  // Define the new custom element
  customElements.define('virtual-scroll-table', VirtualTable)
  