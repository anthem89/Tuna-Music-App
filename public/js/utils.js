
/** @param {HTMLElement} customElement */
export function InjectGlobalStylesheets(customElement) {
	let stylesheets = Array.from(document.head.querySelectorAll("link[rel='stylesheet']")).map((link) => link.href).reverse()
	let loadedStylesheets = 0
	stylesheets.forEach((href) => {
		const link = document.createElement('link')
		link.rel = 'stylesheet'
		link.type = "text/css"
		link.href = href
		link.onload = () => {
			loadedStylesheets++
			if (loadedStylesheets === stylesheets.length) {
				const readyEvent = new CustomEvent("customElementLoaded", { bubbles: true })
				customElement.dispatchEvent(readyEvent)
			}
		}
		customElement.shadowRoot.prepend(link)
	})
}

export function CreateElementFromHTML(htmlString, sanitize = true) {
	const template = document.createElement('template')
	if (sanitize === true) {
		template.innerHTML = DOMPurify.sanitize(htmlString.trim())
	} else {
		template.innerHTML = htmlString.trim()
	}
	return template.content.firstChild
}

export function secondsToTimestamp(seconds) {
	const minutes = Math.floor(seconds / 60)
	const remainingSeconds = seconds % 60
	const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds
	return `${minutes}:${formattedSeconds}`
}

export function RemoveAllChildren(parent) {
	while (parent.firstChild) {
		// Recursively remove all children of the current child element
		RemoveAllChildren(parent.firstChild)
		parent.removeChild(parent.firstChild)
	}
}

export function isMobileView() {
	return window.innerWidth <= 992
}

export function isNullOrWhiteSpace(string) {
	return string == null || string.trim() === ""
}

export function Sleep(milliseconds) {
	return new Promise((resolve) => { setTimeout(resolve, milliseconds) })
}