import { InjectGlobalStylesheets } from "../utils.js"
import { MediaTile } from "./media-tile.js"
import { TrackData, PlaylistData, ArtistData, AlbumData } from "./data-models.js"
import { SongTile } from "./song-tile.js"
import { PlaylistTile } from "./playlist-tile.js"
import { AlbumTile } from "./album-tile.js"
import { ArtistTile } from "./artist-tile.js"
import { InfiniteScrollSongs } from "./infinite-scroll-songs.js"
import { SongActionsMenu } from "./song-actions-menu.js"
import { PlaylistActionsMenu } from "./playlist-actions-menu.js"
import { CurrentScreen } from "../index.js"

export class MultiSelectMenu extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: "open" })

		this.longPressDuration = 600
		this.maxMoveTolerance = 50 // Maximum movement allowed to count as a long press (in pixels)

		this._pressTimer
		this._touchStartX
		this._touchStartY
		this._isLongPress = false

		this.parentMediaListTable = null
		this.multiSelectModeEnabled = false
		/** @type {TrackData[] | PlaylistData[] | ArtistData[] | AlbumData[]} */
		this.multiSelectArray = []
		this.tileType = null
	}

	connectedCallback() {
		this.shadowRoot.innerHTML = `
			<link href="./js/components/multi-select-menu.css" rel="stylesheet" type="text/css">

			<div class="menu-body pre-transition hidden">
				<div class="link-container">
					<a name="select-all">Select All</a>
					<a name="cancel">Cancel</a>
					<a name="actions">Actions</a>
				</div>
			</div>
			
		`
		InjectGlobalStylesheets(this)

		this.menuBody = this.shadowRoot.querySelector(".menu-body")
		this.btnSelectAll = this.shadowRoot.querySelector("a[name='select-all']")
		this.btnCancel = this.shadowRoot.querySelector("a[name='cancel']")
		this.btnActions = this.shadowRoot.querySelector("a[name='actions']")

		this.btnSelectAll.onclick = () => { this.#selectAll() }
		this.btnCancel.onclick = () => { this.DisableMultiSelectMode() }
		this.btnActions.onclick = () => { this.#openActionsMenu() }

		document.addEventListener("contextmenu", (e) => {
			if (this._isLongPress === true) {
				e.preventDefault()
			}
		})

		document.addEventListener("keydown", (e) => {
			if (this.multiSelectModeEnabled === true && e.key === "Escape") {
				this.DisableMultiSelectMode()
			}
		})
	}

	#selectAll() {
		/** @type {InfiniteScrollSongs} */
		const infiniteScrollElement = this.parentMediaListTable.closest("infinite-scroll-songs")
		/** @type {MediaTile[]} */
		const allVisibleMediaTiles = Array.from(this.parentMediaListTable.querySelectorAll(".media-tile"))
		if (infiniteScrollElement != null) {
			this.multiSelectArray = structuredClone(infiniteScrollElement.trackDataArray)
		} else {
			this.multiSelectArray = allVisibleMediaTiles.map((tile) => this.#getMediaTileData(tile))
		}
		allVisibleMediaTiles.forEach((tile) => {
			tile.checkbox.checked = true
		})
	}

	#openActionsMenu() {
		const pos = this.btnActions.getBoundingClientRect()
		switch (this.tileType) {
			case "SONG-TILE":
				/** @type {InfiniteScrollSongs} */
				const infiniteScrollElement = this.parentMediaListTable.closest("infinite-scroll-songs")
				const parentPlaylistId = infiniteScrollElement?.parentPlaylistId
				let songActionsMenu = new SongActionsMenu(parentPlaylistId, this.parentMediaListTable)
				songActionsMenu.SetVisibleOptions({
					playSong: false,
					addToPlaylist: CurrentScreen.screenKey !== "searchMusic",
					removeFromPlaylist: CurrentScreen.screenKey === "playlistSongs",
					downloadToLibrary: CurrentScreen.screenKey === "searchMusic",
					removeFromLibrary: CurrentScreen.screenKey !== "searchMusic",
					downloadToDevice: CurrentScreen.screenKey !== "searchMusic",
					addToQueue: CurrentScreen.screenKey !== "nowPlaying",
					removeFromQueue: CurrentScreen.screenKey === "nowPlaying",
					viewArtist: false,
					viewAlbum: false,
					editSongAttributes: false,
				})
				songActionsMenu.menuCloseCallbacks["beforeClose"] = () => { songActionsMenu.Dispose(); songActionsMenu = null }
				songActionsMenu.ForceShow(pos.x, pos.y + pos.height, pos.height, false, true, this.multiSelectArray, null, false)
				break
			case "PLAYLIST-TILE":
				let playlistActionsMenu = new PlaylistActionsMenu(this.parentMediaListTable)
				playlistActionsMenu.SetVisibleOptions({
					playPlaylist: false,
					editPlaylistAttributes: false,
				})
				playlistActionsMenu.menuCloseCallbacks["beforeClose"] = () => { playlistActionsMenu.Dispose(); playlistActionsMenu = null }
				playlistActionsMenu.ForceShow(pos.x, pos.y + pos.height, pos.height, false, true, this.multiSelectArray, null, false)
				break
			case "ARTIST-TILE":
				return
				break
			case "ALBUM-TILE":
				return
				break
		}
	}

	#getMediaTileData(mediaTile) {
		let data
		switch (mediaTile.tagName) {
			case "SONG-TILE":
				/** @type {SongTile} */
				const songTile = mediaTile
				data = songTile.trackData
				break
			case "PLAYLIST-TILE":
				/** @type {PlaylistTile} */
				const playlistTile = mediaTile
				data = playlistTile.playlistData
				break
			case "ARTIST-TILE":
				/** @type {ArtistTile} */
				const artistTile = mediaTile
				data = artistTile.artistData
				break
			case "ALBUM-TILE":
				/** @type {AlbumTile} */
				const albumTile = mediaTile
				data = albumTile.albumData
				break
		}
		return data
	}

	/** @param {MediaTile} mediaTile */
	AddToMultiSelect(mediaTile) {
		this.EnableMultiSelectMode(mediaTile)
		const tileData = this.#getMediaTileData(mediaTile)
		this.multiSelectArray.push(tileData)
	}

	/** @param {MediaTile} mediaTile */
	RemoveFromMultiSelect(mediaTile) {
		const tileData = this.#getMediaTileData(mediaTile)
		const index = this.multiSelectArray.findIndex((data) => data.id === tileData.id)
		if (index > -1) {
			this.multiSelectArray.splice(index, 1)
		}
		if (this.multiSelectArray.length === 0) { this.DisableMultiSelectMode() }
	}

	/** @param {MediaTile} targetMediaTile */
	EnableMultiSelectMode(targetMediaTile) {
		if (this.multiSelectModeEnabled === true) { return }
		this.menuBody.ontransitionend = null
		// If a media tile is long-pressed, display the multi-select checkboxes on mobile
		this.parentMediaListTable = targetMediaTile.closest(".media-list-table")
		if (this.parentMediaListTable != null) {
			this.parentMediaListTable.classList.toggle("multi-select-enabled", true)
			this.multiSelectModeEnabled = true
			this.tileType = targetMediaTile.tagName
			// Display the multi-select menu
			this.menuBody.classList.toggle("hidden", false)
			setTimeout(() => {
				this.menuBody.classList.toggle("pre-transition", false)
			}, 100)
		}
	}

	DisableMultiSelectMode(disableAnimation = false) {
		if (this.multiSelectModeEnabled === false) { return }
		this.multiSelectArray = []
		this.tileType = null
		this.menuBody.ontransitionend = null
		if (this.parentMediaListTable != null) {
			this.multiSelectModeEnabled = false
			this.parentMediaListTable.classList.toggle("multi-select-enabled", false)
			if (disableAnimation === true) {
				this.menuBody.classList.toggle("hidden", true)
			} else {
				this.menuBody.ontransitionend = () => {
					this.menuBody.classList.toggle("hidden", true)
					this.menuBody.ontransitionend = null
				}
			}
			this.menuBody.classList.toggle("pre-transition", true)
			this.parentMediaListTable.querySelectorAll(".media-tile-checkbox-container > input").forEach((checkbox) => {
				checkbox.checked = false
			})
			this.parentMediaListTable = null
		}
	}

	startLongPress(e) {
		const touch = e.touches[0]
		this._touchStartX = touch.clientX
		this._touchStartY = touch.clientY
		// Get the target touch element even traversing through shadow doms
		const targetElement = e.composedPath()[0]
		// Start the timer for detecting a long press
		this._pressTimer = setTimeout(() => {
			this._isLongPress = true
			// Handle long press logic here
			/** @type {MediaTile} */
			const targetMediaTile = targetElement?.closest(".media-tile")
			if (targetMediaTile?.allowMultiSelect === true) { targetMediaTile.checkbox.click() }

		}, this.longPressDuration)
	}

	cancelLongPress() {
		clearTimeout(this._pressTimer)
		setTimeout(() => {
			this._touchStartX = null
			this._touchStartY = null
			this._isLongPress = false
		}, 100)
	}

	longPressMove(e) {
		const touch = e.touches[0]
		const deltaX = Math.abs(touch.clientX - this._touchStartX)
		const deltaY = Math.abs(touch.clientY - this._touchStartY)
		// Cancel the long press if the user has moved too far
		if (deltaX > this.maxMoveTolerance || deltaY > this.maxMoveTolerance) {
			this.cancelLongPress()
		}
	}

	disconnectedCallback() {

	}
}

customElements.define("multi-select-menu", MultiSelectMenu)
