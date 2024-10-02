import { SwitchToScreen, OverrideMobileBrowserBackButton } from "../index.js"

export class NavigationHistory {
	constructor() {
		this.history = []
		this.currentIndex = -1
		this.suspendHistory = false

		document.addEventListener("beforeSwitchToScreen", (e) => {
			if (e.defaultPrevented || this.suspendHistory) {
				return
			}

			OverrideMobileBrowserBackButton()

			const { screenKey, args } = e.detail
			// Remove any forward history if present
			this.history = this.history.slice(0, this.currentIndex + 1)
			this.history.push(new NavigationHistoryItem(screenKey, args))
			// Update current index to point to the newly added screen
			this.currentIndex = this.history.length - 1
		})
	}

	GoBack() {
		if (this.CanGoBack()) {
			const { screenKey, args } = this.history[this.currentIndex - 1]
			// Suspend history update to prevent adding this screen again
			this.suspendHistory = true
			SwitchToScreen(screenKey, args)
			this.suspendHistory = false
			this.currentIndex -= 1
		}
	}

	GoForward() {
		if (this.CanGoForward()) {
			const { screenKey, args } = this.history[this.currentIndex + 1]
			// Suspend history update to prevent adding this screen again
			this.suspendHistory = true
			SwitchToScreen(screenKey, args)
			this.suspendHistory = false
			this.currentIndex += 1
		}
	}

	CanGoBack() {
		return this.currentIndex > 0
	}

	CanGoForward() {
		return this.currentIndex < this.history.length - 1
	}

	Clear() {
		this.history = []
		this.currentIndex = -1
	}
}

class NavigationHistoryItem {
	constructor(screenKey, args) {
		this.screenKey = screenKey
		this.args = args
	}
}