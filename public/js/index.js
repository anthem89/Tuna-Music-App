import { RemoveAllChildren } from "./utils.js"
import * as banners from "./components/alert-banner.js"
import { ContextMenu } from "./components/context-menu.js"

/** @type {banners.AlertBanner} */
export const AlertBanner = document.querySelector("alert-banner")

export const NavMenuStructure = {
	homeSection: { title: null, parent: null },
	home: { title: "Home", tagName: "home-screen", icon: "bi bi-house-door", parent: "homeSection" },

	musicSection: { title: "Music", parent: null },
	searchMusic: { title: "Search Music", tagName: "search-music-screen", icon: "bi bi-search", parent: "musicSection" },

	library: { title: "My Library", icon: "bi bi-collection", parent: "musicSection" },
	allSongs: { title: "All Songs", tagName: "library-screen", icon: null, parent: "library" },
	playlists: { title: "Playlists", tagName: "playlists-screen", icon: null, parent: "library" },

	podcastsSection: { title: "Podcasts", parent: null },
	searchPodcasts: { title: "Search Podcasts", tagName: "search-podcasts-screen", icon: "bi bi-search", parent: "podcastsSection" },
	myPodcasts: { title: "My Podcasts", tagName: "podcasts-screen", icon: "bi bi-headphones", parent: "podcastsSection" },

	settingsSection: { title: "Settings", parent: null },
	settings: { title: "My Settings", tagName: "settings-screen", icon: "bi bi-gear", parent: "settingsSection" },

}

export let currentScreenKey

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

export function SwitchToScreen(screenKey) {
	const targetScreen = NavMenuStructure[screenKey]

	if (targetScreen != null) {
		if (currentScreenKey !== screenKey) {
			// Emit an event before switching screens. This allows attached listeners to cancel the screen switch if needed.
			const event = new CustomEvent('beforeSwitchToScreen', { cancelable: true, detail: { screenKey: screenKey } })
			document.dispatchEvent(event)
			if (event.defaultPrevented) { return }

			currentScreenKey = screenKey

			if (targetScreen.tagName != null) {
				// Remove the contents of the previously active module
				const contentWrapper = document.querySelector("#module-content-container > section")
				RemoveAllChildren(contentWrapper)
				// Update the title of the module
				const contentTitle = document.querySelector("#module-title")
				contentTitle.innerText = NavMenuStructure[screenKey].title || ""
				// Create a new instance of the currently active module, and add it to the DOM
				/** @type {HTMLElement} */
				const screenElement = document.createElement(NavMenuStructure[screenKey].tagName)
				contentWrapper.classList.add("pre-transition")
				contentWrapper.style.visibility = "hidden"
				contentWrapper.appendChild(screenElement)

				// Wait until the module's custom HTML element has finished initializing
				screenElement.addEventListener("customElementLoaded", () => {
					contentWrapper.style.visibility = "visible"
					requestAnimationFrame(() => {
						contentWrapper.classList.remove("pre-transition")
					})
				}, { once: true })
			}
			// Update the stylings of the nav-links to reflect the new currently active module
			const targetLink = document.querySelector("a[data-screen='" + screenKey + "']")
			if (targetLink != null) {
				if (targetLink.dataset.bsToggle !== "collapse") {
					// Collapse the sidebar menu if needed
					document.body.classList.toggle("toggle-sidebar", false)
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
			document.body.classList.toggle("toggle-sidebar", false)
		}
	}
}


function BuildNavMenu() {
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
		if (rootSection.parent === null) {
			if (rootSection.title) {
				navMenuContainer.insertAdjacentHTML("beforeend", sectionTitle(rootSection.title))
			}
			navMenuContainer.insertAdjacentHTML("beforeend", buildMenu(key))
		}
	}
}


function Initialize() {
	// Sidebar Toggle
	document.querySelector(".toggle-sidebar-btn").onclick = () => {
		document.body.classList.toggle("toggle-sidebar")
	}
	// Page Mask Click
	document.querySelector("#sidebar-nav-page-mask").onclick = () => {
		document.body.classList.toggle("toggle-sidebar", false)
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
		appHeaderMenu.ForceShow(pos.x + pos.width, pos.y + pos.height, pos.height, false, true, e.target)
	}

	BuildNavMenu()

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

	SwitchToScreen("allSongs")


	let vh = window.innerHeight * 0.01;
	// Then we set the value in the --vh custom property to the root of the document
	document.documentElement.style.setProperty('--vh', `${vh}px`);
}

Initialize()