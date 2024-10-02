import { RemoveAllChildren, isMobileView } from "./utils.js"
import * as banners from "./components/alert-banner.js"
import * as modals from "./components/confirmation-modal.js"
import { AudioPlayer } from "./components/audio-player.js"
import { NavigationHistory } from "./components/navigation-history.js"
import { ContextMenu } from "./components/context-menu.js"
import { HomeScreen } from "./screens/home-screen.js"
import { SearchMusicScreen } from "./screens/search-music-screen.js"
import { LibraryScreen } from "./screens/library-screen.js"
import { PlaylistsScreen } from "./screens/playlists-screen.js"
import { PlaylistSongsScreen } from "./screens/playlist-songs-screen.js"
import { SearchPodcastsScreen } from "./screens/search-podcasts-screen.js"
import { PodcastsScreen } from "./screens/podcasts-screen.js"
import { SettingsScreen } from "./screens/settings-screen.js"


/** @type {banners.AlertBanner} */
export const AlertBanner = document.querySelector("alert-banner")
/** @type {modals.ConfirmationModal} */
export const ConfirmationModal = document.querySelector("confirmation-modal")
/** @type {NavigationHistory} */
export const AppNavigationHistory = new NavigationHistory()
/** @type {AudioPlayer} */
export const AudioPlayerElement = document.querySelector("audio-player")

export const NavMenuStructure = {
	homeSection: { "title": null, "parent": null },
	home: { "title": "Home", "prototype": HomeScreen, "icon": "bi bi-house-door", "parent": "homeSection" },

	musicSection: { "title": "Music", "parent": null },
	searchMusic: { "title": "Search Music", "prototype": SearchMusicScreen, "icon": "bi bi-search", "parent": "musicSection" },
	library: { "title": "My Library", "icon": "bi bi-collection", "parent": "musicSection" },
	allSongs: { "title": "All Songs", "prototype": LibraryScreen, "icon": null, "parent": "library" },
	playlists: { "title": "Playlists", "prototype": PlaylistsScreen, "icon": null, "parent": "library" },
	playlistSongs: { "title": "Playlist Songs", "prototype": PlaylistSongsScreen, "icon": null, "parent": null, "hidden": true },

	podcastsSection: { "title": "Podcasts", "parent": null },
	searchPodcasts: { "title": "Search Podcasts", "prototype": SearchPodcastsScreen, "icon": "bi bi-search", "parent": "podcastsSection" },
	myPodcasts: { "title": "My Podcasts", "prototype": PodcastsScreen, "icon": "bi bi-headphones", "parent": "podcastsSection" },

	settingsSection: { "title": "Settings", "parent": null },
	settings: { "title": "My Settings", "prototype": SettingsScreen, "icon": "bi bi-gear", "parent": "settingsSection" },
}

export function SessionExpired() {
	window.location.href = "/login?session-expired"
}

export async function LogOut() {
	const res = await fetch("/logout")
	if (res.redirected) {
		window.location.href = res.url
	} else {
		AlertBanner.Toggle(true, true, "Error logging out", 7000, AlertBanner.bannerColors.error)
	}
}

export function SwitchToScreen(screenKey, args) {
	const targetScreen = NavMenuStructure[screenKey]

	if (targetScreen != null) {
		const currentScreenKey = AppNavigationHistory.history[AppNavigationHistory.currentIndex]?.screenKey
		if (currentScreenKey !== screenKey) {
			// Emit an event before switching screens. This allows attached listeners to cancel the screen switch if needed.
			const event = new CustomEvent('beforeSwitchToScreen', { cancelable: true, detail: { screenKey: screenKey, args: args } })
			document.dispatchEvent(event)
			if (event.defaultPrevented) { return }

			if (targetScreen.prototype != null) {
				// Remove the contents of the previously active module
				const contentWrapper = document.querySelector("#module-content-container > section")
				RemoveAllChildren(contentWrapper)
				// Update the title of the module
				const contentTitle = document.querySelector("#module-title")
				contentTitle.innerText = NavMenuStructure[screenKey].title || ""
				// Create a new instance of the currently active module, and add it to the DOM
				/** @type {HTMLElement} */
				const screenElement = new NavMenuStructure[screenKey].prototype(args)
				contentWrapper.classList.add("pre-transition")
				contentWrapper.style.visibility = "hidden"
				// Wait until the module's custom HTML element has finished initializing
				screenElement.addEventListener("customElementLoaded", () => {
					contentWrapper.style.visibility = "visible"
					requestAnimationFrame(() => {
						contentWrapper.classList.remove("pre-transition")
					})
				}, { once: true })

				contentWrapper.appendChild(screenElement)
			}
			// Update the stylings of the nav-links to reflect the new currently active module
			const targetLink = document.querySelector("a[data-screen='" + screenKey + "']")
			if (targetLink != null) {
				if (targetLink.dataset.bsToggle !== "collapse") {
					// Collapse the sidebar menu if needed
					document.body.classList.toggle("sidebar-visible", false)
				}
				// If user clicked on the currently active module nav-link, then do nothing
				if (targetLink.classList.contains("active") === true || targetLink.dataset?.screen == null) { return }
				if (targetLink.classList.contains("no-navigate") === false) {
					// Remove highlight from all nav-links
					document.querySelectorAll("#sidebar-nav a.active").forEach((navLink) => {
						navLink.classList.toggle("active", false)
					})
					// Apply highlight to the currently active nav-link
					targetLink.classList.toggle("active", true)
					// If the target nav link is in a collapsed section, then expand it
					const collapsableSection = targetLink.closest(".nav-item:has(.nav-link.collapsed)")?.querySelector(".nav-content")
					if (collapsableSection != null) {
						new bootstrap.Collapse(collapsableSection).toggle()
					}
				}
			}
		} else {
			// If the user clicked on the currently active module's nav link, then collapse the sidebar menu if needed
			document.body.classList.toggle("sidebar-visible", false)
		}
	}
}


function BuildSideBarNavMenu() {
	const sectionTitle = (title) => {
		return `<li class="nav-heading">${title}</li>`
	}
	const navItemNoChildren = (screenKey, title, icon) => {
		return `
		<li class="nav-item">
		  <a data-screen="${screenKey}" class="nav-link collapsed">
			<i class="${icon}"></i>
			<span>${title}</span>
		  </a>
		</li>
	  `
	}
	const navItemWithChildren = (sectionKey, title, icon, children) => {
		return `
		<li class="nav-item">
		  <a class="nav-link collapsed" data-bs-target="#${sectionKey}-nav-section" data-bs-toggle="collapse">
			<i class="${icon}"></i>
			<span>${title}</span>
			<i class="bi bi-chevron-down ms-auto"></i>
		  </a>
		  <ul id="${sectionKey}-nav-section" class="nav-content collapse" data-bs-parent="#sidebar-nav">
			${children}
		  </ul>
		</li>
	  `
	}
	const navItemChild = (screenKey, title) => {
		return `
		<li>
		  <a data-screen="${screenKey}">
			<i class="bi bi-circle"></i><span>${title}</span>
		  </a>
		</li>
	  `
	}
	const navMenuContainer = document.querySelector("#sidebar-nav")
	// Helper function to find children of a specific parent key
	const getChildren = (parentKey) => {
		return Object.keys(NavMenuStructure).filter(key => NavMenuStructure[key].parent === parentKey)
	}
	// Build the menu structure
	const buildMenu = (parentKey = null) => {
		const childrenKeys = getChildren(parentKey)
		let menuHtml = ""
		for (const key of childrenKeys) {
			const item = NavMenuStructure[key]
			const children = getChildren(key)
			if (children.length === 0) {
				// No children
				menuHtml += navItemNoChildren(key, item.title, item.icon)
			} else {
				// Has children
				let childrenHtml = ""
				children.forEach(childKey => {
					const child = NavMenuStructure[childKey]
					childrenHtml += navItemChild(childKey, child.title)
				})
				menuHtml += navItemWithChildren(key, item.title, item.icon, childrenHtml)
			}
		}
		return menuHtml
	}
	// Build and insert sections into the nav container
	for (const key of Object.keys(NavMenuStructure)) {
		const rootSection = NavMenuStructure[key]
		if (rootSection.hidden === true) { continue }
		if (rootSection.parent === null) {
			if (rootSection.title != null) {
				navMenuContainer.insertAdjacentHTML("beforeend", sectionTitle(rootSection.title))
			}
			navMenuContainer.insertAdjacentHTML("beforeend", buildMenu(key))
		}
	}
}


function InitializeUi() {
	// Sidebar Toggle
	document.querySelector(".toggle-sidebar-btn").onclick = () => {
		ToggleSideNavMenu(!document.body.classList.contains("sidebar-visible"))
	}
	// Page Mask Click
	document.querySelector("#sidebar-nav-page-mask").onclick = () => {
		ToggleSideNavMenu(false)
	}

	const appHeaderMenu = new ContextMenu(null, [
		{
			text: NavMenuStructure.home.title,
			iconClass: NavMenuStructure.home.icon,
			clickEvent: () => { SwitchToScreen("home") }
		},
		"divider",
		{
			text: NavMenuStructure.settings.title,
			iconClass: NavMenuStructure.settings.icon,
			clickEvent: () => { SwitchToScreen("settings") }
		},
		"divider",
		{
			text: "Log Out",
			iconClass: "bi bi-box-arrow-right",
			clickEvent: () => { LogOut() }
		},
	], "dropdown", true)

	document.querySelector("#app-header-logo img").onclick = (e) => {
		const pos = e.target.getBoundingClientRect()
		appHeaderMenu.ForceShow(pos.x + pos.width + 10, pos.y + pos.height, pos.height, false, true, e.target)
	}

	BuildSideBarNavMenu()

	// Nav Link click events
	document.querySelector("#sidebar-nav").onclick = (e) => {
		const clickTarget = e.target.closest("a")
		if (clickTarget != null) {
			SwitchToScreen(clickTarget.dataset.screen)
		}
	}

	// When screens scroll, collapse the screen title to the app header
	document.querySelector("#module-content-container").addEventListener("scroll", (e) => {
		e.target.classList.toggle("collapse-to-header", e.target.scrollTop > 20)
	}, { passive: true })

	InitializeSwipeGestures()

	SwitchToScreen("home")
}

// Hack to force PWA app to calculate screen height correctly after a page redirect
if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true) {
	const updateViewportHeight = () => {
		const viewportHeight = window.innerHeight
		document.documentElement.style.setProperty('--vh', `${viewportHeight * 0.01}px`)
	}
	window.addEventListener("load", updateViewportHeight, { once: true })
	window.addEventListener("resize", updateViewportHeight)
}

const sideBarNavMenu = document.querySelector("#sidebar")
export function ToggleSideNavMenu(open) {
	sideBarNavMenu.classList.toggle("isDragging", false)
	sideBarNavMenu.style.transform = null
	document.body.classList.toggle("sidebar-visible", open)
	if (isMobileView() === true && open === true) {
		window.history.pushState({}, null, "")
	}
}

const swipePositions = {
	minimumSwipeDistance: 100,
	startX: 0,
	currentX: 0,
}

function InitializeSwipeGestures() {
	const sideBarWidth = 300 // This must match the CSS variable in index.css

	sideBarNavMenu.addEventListener("touchstart", (e) => {
		if (isMobileView() === false) { return }
		swipePositions.startX = e.touches[0].clientX
	}, { passive: true })

	sideBarNavMenu.addEventListener("touchmove", (e) => {
		if (isMobileView() === false) { return }
		sideBarNavMenu.classList.toggle("isDragging", true)
		swipePositions.currentX = e.touches[0].clientX
		let translateX = swipePositions.currentX - swipePositions.startX
		// Prevent the menu from going beyond the boundaries
		if (translateX < -sideBarWidth) { translateX = -sideBarWidth }
		if (translateX > 0) { translateX = 0 }
		// Move the menu along with the finger
		sideBarNavMenu.style.transform = `translate3d(${translateX}px, 0px, 0px)`
	}, { passive: true })

	sideBarNavMenu.addEventListener("touchend", () => {
		if (isMobileView() === false) { return }
		if (sideBarNavMenu.classList.contains("isDragging") === false) { return }
		sideBarNavMenu.classList.toggle("isDragging", false)
		const menuPosition = parseInt(sideBarNavMenu.style.transform.replace("translate3d(", "").replace("px, 0px, 0px)", ""))
		// If the swipe is greater than the minimum swipe distance, then close it, otherwise bounce it back open
		ToggleSideNavMenu(menuPosition > swipePositions.minimumSwipeDistance * -1)
	})

	// Allow opening menu when swiping right from off screen
	document.addEventListener("touchstart", (e) => {
		if (isMobileView() === false) { return }
		swipePositions.startX = e.touches[0].clientX
	}, { passive: true })

	document.addEventListener("touchmove", (e) => {
		if (isMobileView() === false) { return }
		if (document.querySelector(".contextmenu-pageMask") != null) { return }
		if (document.body.classList.contains("sidebar-visible") || swipePositions.startX > 20) { return }
		sideBarNavMenu.classList.toggle("isDragging", true)
		swipePositions.currentX = e.touches[0].clientX
		let translateX = swipePositions.currentX - swipePositions.startX - sideBarWidth
		// Prevent dragging beyond the boundaries
		if (translateX < -sideBarWidth) { translateX = -sideBarWidth }
		if (translateX > 0) { translateX = 0 }

		sideBarNavMenu.style.transform = `translate3d(${translateX}px, 0px, 0px)`
	}, { passive: true })

	document.addEventListener("touchend", () => {
		if (isMobileView() === false) { return }
		if (sideBarNavMenu.classList.contains("isDragging") === false) { return }
		sideBarNavMenu.classList.toggle("isDragging", false)
		const menuPosition = parseInt(sideBarNavMenu.style.transform.replace("translate3d(", "").replace("px, 0px, 0px)", ""))
		ToggleSideNavMenu(menuPosition > sideBarWidth * -1 + swipePositions.minimumSwipeDistance)
	})
}

// Intercept browser "back" and "forward" navigation events
window.history.pushState({}, null, "")
window.addEventListener("popstate", (e) => {
	if (isMobileView() === true) {
		const activeContextMenus = document.querySelectorAll(".contextmenu-container")
		if (activeContextMenus.length > 0) {
			activeContextMenus.forEach((contextMenu) => {
				contextMenu.classReference.ForceClose()
			})
		} else if (document.body.classList.contains("sidebar-visible")) {
			document.body.classList.toggle("sidebar-visible", false)
		} else {
			AppNavigationHistory.GoBack()
		}
	}
})

window.addEventListener("beforeunload", (e) => {
	if (isMobileView() === true) {
		e.preventDefault()
	}
})

InitializeUi()