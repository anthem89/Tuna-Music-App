import { InjectGlobalStylesheets } from "../utils.js"
import { InfiniteScrollSongs } from "../components/infinite-scroll-songs.js"

export class LibraryScreen extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: "open" })
	}

	async connectedCallback() {
		this.shadowRoot.innerHTML = `
			<link href="./js/screens/library-screen.css" rel="stylesheet" type="text/css">
			<div id="library-table-wrapper"></div>
		`
		InjectGlobalStylesheets(this)

		const libraryTable = new InfiniteScrollSongs("/user-library", "all-songs")
		libraryTable.songActionsMenu.SetVisibleOptions({ removeFromPlaylist: false, downloadToLibrary: false })
		this.shadowRoot.querySelector("#library-table-wrapper").appendChild(libraryTable)
	}

	disconnectedCallback() {

	}
}

customElements.define("library-screen", LibraryScreen)









