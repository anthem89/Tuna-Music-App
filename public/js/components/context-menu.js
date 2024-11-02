/**
 * @param {String} selector The menu will only be enabled on elements matching this queryselector string
 * @param {String} menuOptions An array of JavaScript Objects describing the menu structure. Options are: "text", "iconClass", "extraText", "customHTML", "clickEvent", "disabled", "hidden", "subMenu", "divider". Example: [{'text': 'item 1'}, 'divider', {'text': 'item 2', 'subMenu': [{'text': 'item 3'}]}]
 * @param {String} animationType Options are "context", "dropdown", or "none". "Context" will animate on both X and Y axis, whereas "dropdown" will animate only on the Y axis
 * @param {Boolean} allowMobileView Whether or not the context menu automatically converts to an action sheet in mobile view
 */
export class ContextMenu {
	constructor(selector, menuOptions, animationType, allowMobileView) {
		this._selector = selector
		this._menuOptions = menuOptions
		this._clickListener
		this.topLevelMenu
		// Optional ability to add additional classes to the menu body for styling purposes
		this.customClass = null
		this.doNotCloseOnClick = false
		// Pass in an array of event names that will not trigger the context menu to close (ie: "scroll", "blur", "resize", etc)
		this.ignoreCloseMenuEvents = []
		// vertical options are "top" / "bottom", horizontal options are "left" / "right".  
		//This will override the auto-position direction, and could open the menu off-screen
		this.forceOpenAnimationDirection = { vertical: null, horizontal: null }
		this.dropdownMenuDistance = this._selector != null ? 0 : 5
		// "context" will animate the menu like a normal context menu on both X and Y axis. "dropdown" will animate the menu open only on the Y axis
		this.animationType = (this._selector != null ? "context" : (animationType || "dropdown"))
		this.targetElement = null
		this.events = { beforeRender: null, afterRender: null }
		this.allowMobileView = allowMobileView || false
		// The window width in px where the menu will convert to a mobile view
		this.mobileViewBreakpoint = 992
		this.mobileViewHasPageMask = true

		this.swipePositions = {
			minimumSwipeDistance: 100,
			startY: 0,
			currentY: 0,
			scrollStarted: false
		}

		// An example of when you might want to prevent the menu from stealing focus is an auto-complete dropdown menu for a text input
		this.menuCanStealFocus = true

		// You may provide callbacks for specific scenarios where you need to run code before the context menu closes
		// You can provide one time callbacks by deleting the key from the menuCloseCallbacks object within the callback once it is complete
		this.menuCloseCallbacks = {}
		this.contextMenuIsVisible = false
		this.eventListenerReferences = { mousedown: null, keydown: null, wheel: null, blur: null, resize: null }

		// If the ContextMenu type is "right click" then assign a listener for the "contextmenu" DOM event
		if (this._selector != null) {
			this._clickListener = (e) => {
				this.targetElement = e.target.closest(selector)
				if (this.targetElement != null) {
					e.preventDefault()
					if (this.events.beforeRender) { this.events.beforeRender() }
					this._render(this._menuOptions, e.pageX - document.documentElement.scrollLeft, e.pageY - document.documentElement.scrollTop, null, true, false, null, true)
					if (this.events.afterRender) { this.events.afterRender() }
					this.targetElement.classList.toggle("contextMenuFocus", true)
				}
			}
			document.addEventListener('contextmenu', this._clickListener)
		}
	}

	/** Programmatically force the menu to open
	 * @param {Number} posX The x coordinate for the origin of where the menu will appear
	 * @param {Number} posY The y coordinate for the origin of where the menu will appear
	 * @param {Number} targetElementHeight
	 * @param {Boolean} defaultSelection Boolean whether or not the first item in the menu starts off highlighted by default
	 * @param {Boolean} autoPosition Should the top level menu body attempt to re-position itself vertically to avoid opening off screen (even if it means overlapping the target element)
	 */
	ForceShow(posX, posY, targetElementHeight = null, defaultSelection, autoPosition, targetElement) {
		if (targetElement != null) {
			this.targetElement = targetElement
			this.targetElement.classList.toggle("contextMenuFocus", true)
		}
		if (this.events.beforeRender) { this.events.beforeRender() }
		this._render(this._menuOptions, posX, posY, null, this.animationType !== "none", defaultSelection, targetElementHeight, autoPosition)
		if (this.events.afterRender) { this.events.afterRender() }
	}

	/** Dynamically build the context menu based on the menuOptions object
	 * @param {Array} menuOptions The JSON object that describes the menu structure
	 * @param {Number} posX The x coordinate for the origin of where the menu will appear
	 * @param {Number} posY The y coordinate for the origin of where the menu will appear
	 * @param {HTMLElement} menuParent The parent element of the menu. document.body means it is the top level menu, then each level down is the parent of a submenu
	 * @param {Boolean} menuAnimation Animate the opening of the menu
	 * @param {Boolean} defaultSelection Boolean whether or not the first item in the menu starts off highlighted by default
	 * @param {Number} targetElementHeight This is used to calculate the vertical offset that the menu will open at to avoid covering the target element if forced to open upwards
	 * @param {Boolean} autoPosition Should the top level menu body attempt to re-position itself vertically to avoid opening off screen (even if it means overlapping the target element)
	 */
	_render(menuOptions, posX, posY, menuParent, menuAnimation, defaultSelection, targetElementHeight, autoPosition) {
		try {
			const isMobileView = this.allowMobileView === true && window.innerWidth < this.mobileViewBreakpoint
			
			// Override the mobile browser's back button to close the context menu insted of navigating
			if (isMobileView === true) {
				window.history.pushState({}, null, "")
			}

			if (menuParent == null) { menuParent = document.body }
			if (autoPosition === undefined) { autoPosition = true }

			let menuBody = document.createElement('div')

			// Attach a reference to the JavaScript class object to the DOM element
			// Example: document.querySelector(".contextmenu-container").classReference.ForceClose()
			menuBody.classReference = this

			menuBody.classList.add("contextmenu-container")
			if (this.customClass != null) {
				menuBody.classList.add(this.customClass)
			}

			menuBody.classList.toggle("mobile-view", isMobileView)

			// Adjust the menu open animation to only animate on the Y axis if the menu is a dropdown
			if (isMobileView === false) {
				menuBody.classList.toggle("dropdownAnimation", (this.animationType === "dropdown"))
			}

			// If menuParent !== document.body then its a submenu, so it needs to have position: relative;
			if (menuParent === document.body) {
				this.topLevelMenu = menuBody
				// Delete all elements with className contextmenu-container
				this.CloseAllContextMenus(false)
				// Register events that will trigger the context menu to close (like clicking outside the menu or scrolling, etc). Function automatically prevents duplicate event registrations
				this.#toggleContextMenuLock(true)

				menuBody.style.position = 'fixed'
				menuBody.style.left = posX + 'px'
				if (targetElementHeight != null) {
					menuBody.style.top = (posY + this.dropdownMenuDistance) + 'px' // If displaying a dropdown menu, add additional spacing
				} else {
					menuBody.style.top = posY + 'px' // If displaying a right-click menu, position it exactly where the user clicked
				}

				if (isMobileView === true && this.mobileViewHasPageMask === true) {
					const pageMask = document.createElement("div")
					pageMask.className = "contextmenu-pageMask"
					document.body.appendChild(pageMask)
					requestAnimationFrame(() => { pageMask.classList.toggle("visible") })
				}
			} else {
				menuBody.classList.toggle("submenu", true)
				menuBody.style.left = -menuParent.offsetLeft + menuParent.offsetWidth + 'px'
			}


			menuOptions.forEach((menuItem) => {

				if (typeof menuItem === 'object') {
					let item = document.createElement('div')
					item.style.position = 'relative'

					let hoverArea = document.createElement('div')
					hoverArea.className = "contextmenu-item"

					item.appendChild(hoverArea)

					if (menuItem.hasOwnProperty('hidden')) {
						item.classList.toggle("hidden", menuItem.hidden)
						hoverArea.classList.toggle("disabled", menuItem.hidden)
					}

					if (menuItem.hasOwnProperty('disabled')) {
						hoverArea.classList.toggle("disabled", menuItem.disabled)
					}

					if (menuItem.hasOwnProperty('customHTML')) {
						const customHTML = document.createElement('div')
						customHTML.className = "contextmenu-custom-html"
						hoverArea.insertAdjacentHTML("beforeend", menuItem.customHTML)
					}

					if (menuItem.hasOwnProperty('customClass')) {
						hoverArea.className = hoverArea.className + " " + (menuItem.customClass || "")
					}

					if (menuItem.hasOwnProperty('text')) {
						const text = document.createElement('span')
						text.className = "contextmenu-text"
						text.textContent = menuItem.text || ''
						if (menuItem.hasOwnProperty('iconClass')) {
							const icon = document.createElement("i")
							icon.className = "contextmenu-icon " + menuItem.iconClass
							text.insertAdjacentElement("afterbegin", icon)
						}
						hoverArea.appendChild(text)
					}

					if (menuItem.hasOwnProperty('extraText')) {
						const extraText = document.createElement('span')
						extraText.className = "contextmenu-extraText contextmenu-text"
						extraText.textContent = menuItem.extraText
						hoverArea.appendChild(extraText)
					}

					if (menuItem.hasOwnProperty('subMenu')) {
						let caret = document.createElement("i")
						caret.className = "contextmenu-caret bi bi-chevron-right"
						hoverArea.appendChild(caret)
					}

					// Helpber function to open a submenu and ensure no other submenus are open simultaneously
					let submenuTimeout
					const openSubMenu = (triggerType) => {
						clearTimeout(submenuTimeout)
						// If the item has a submenu, open it after a short delay of hovering
						if (menuItem.hasOwnProperty("subMenu")) {
							if (isMobileView === true) {
								// If in mobile view, close the parent menu before opening the sub menu
								document.querySelector(".contextmenu-pageMask").addEventListener("transitionend", () => {
									this._render(menuItem.subMenu, null, null, null, true, false, null, false)
								}, { once: true })
								this.ForceClose()
							} else {
								// Only open the submenu if the item is not already focused
								if (item.classList.contains("contextmenu-item-focus") === false) {
									this.CloseAllSubMenus(menuBody)
									if (menuItem.hasOwnProperty('disabled') === false || menuItem.disabled === false) {
										item.classList.toggle('contextmenu-item-focus', true)
										submenuTimeout = setTimeout(() => {
											// Render the submenu
											this._render(menuItem.subMenu, 0, 0, item, true, triggerType.defaultSelection, null, true)
											// If the cursor was moved to a different menu item while the submenu was in the process of rendering, then close the submenu
											if (item.classList.contains("contextmenu-item-focus") === false) {
												this.CloseAllSubMenus(menuBody)
											}
										}, triggerType.delay)
									}
								}
							}
						} else {
							// If the current menu item does not have a submenu, close any other open submenus
							this.CloseAllSubMenus(menuBody)
						}
					}

					if (menuItem.hasOwnProperty('disabled') === false || menuItem.disabled === false) {
						if (menuItem.hasOwnProperty("subMenu")) {
							item.onclick = (e) => {
								// Open submenu if user clicks on it
								if (item.querySelector(".submenu.visible") == null) {
									item.classList.toggle("contextmenu-item-focus", false)
									menuBody.querySelectorAll(".hover").forEach((e) => { e.classList.toggle("hover", false) })
									hoverArea.classList.toggle("hover", true)
									openSubMenu(subMenuTriggerTypes.mouseclick)
								}
							}
						} else if (menuItem.hasOwnProperty('clickEvent')) {
							item.onclick = (e) => {
								// If the menu item has a click event callback, execute it
								if (menuItem.clickEvent != null) { menuItem.clickEvent(e) }
								if (this.doNotCloseOnClick === false) { this.ForceClose() }
							}
						}
					}

					if (isMobileView === false) {
						// Menu item mouse enter event
						hoverArea.onmousemove = () => {
							// Highlight background - can't use CSS :hover because the arrow keys need to be able to activate the hover style as well
							menuBody.querySelectorAll(".hover").forEach((e) => { e.classList.toggle("hover", false) })
							hoverArea.classList.toggle("hover", true)
						}
						hoverArea.onmouseenter = () => {
							// If the item has a submenu, open it
							openSubMenu(subMenuTriggerTypes.mouseenter)
						}
						// Menu item mouse leave event
						hoverArea.onmouseleave = () => { hoverArea.classList.toggle("hover", false) }
					}

					// Event to open sub menu when right arrow key is pressed
					hoverArea.addEventListener('open submenu on arrow key', () => { openSubMenu(subMenuTriggerTypes.arrowkey) })

					menuBody.appendChild(item)

				} else if (menuItem === "divider") {
					var hr = document.createElement('hr')
					hr.className = "contextmenu-divider"
					menuBody.appendChild(hr)
				}
			})

			// Remove visually consecutive dividers
			let lastVisibleDivider = null
			let firstVisibleItem = null
			const children = Array.from(menuBody.children)
			children.forEach((menuItem, index) => {
				if (menuItem.tagName === "DIV") {
					const isHidden = menuItem.classList.contains("hidden")
					if (isHidden === false) {
						lastVisibleDivider = null
						if (firstVisibleItem == null) { firstVisibleItem = menuItem }
					}
				} else if (menuItem.tagName === "HR") {
					if (firstVisibleItem == null || index === children.length - 1 || lastVisibleDivider != null) {
						menuBody.removeChild(menuItem)
					} else {
						lastVisibleDivider = menuItem
						if (firstVisibleItem == null) { firstVisibleItem = menuItem }
					}
				}
			})
			if (lastVisibleDivider != null) {
				lastVisibleDivider.remove()
			}

			// If "defaultSelection" === true, then the first item in the menu will start out highlighted
			if (defaultSelection === true) { menuBody.querySelector(".contextmenu-item:not(.disabled)")?.classList.toggle("hover", true) }

			// Add event to handle certain keypresses while the context menu is open
			if (isMobileView === false) {
				menuBody.onkeydown = (e) => {
					e.preventDefault()
					e.stopPropagation()
					this.SendKeyCommand(menuBody, e.key)
				}
			}

			// Disable browser context menu on top of this context menu
			menuBody.oncontextmenu = (e) => { e.preventDefault() }

			// Add the new menu to the DOM
			menuParent.appendChild(menuBody)

			// An example of when you might want to prevent the menu from stealing focus is an auto-complete dropdown menu for a text input
			if (this.menuCanStealFocus === true) {
				menuBody.tabIndex = 0
				menuBody.focus()
			}

			// Enable keydown events on the topmost menu
			menuBody.setAttribute("data-keydown-events-enabled", "true")
			if (menuParent !== document.body) {
				// Disable keydown events on lower level menus
				menuBody.parentElement.closest(".contextmenu-container").setAttribute("data-keydown-events-enabled", "false")
			}

			// Determine where the context-menu will be on the screen
			let docWidth = document.documentElement.clientWidth
			let docHeight = document.documentElement.clientHeight

			const animationDirection = { vertical: "top", horizontal: "left" }
			// If menuParent !== document.body, it is a submenu
			if (menuParent === document.body) {
				// autoPosition boolean determines if the top level menu body should attempt to re-position itself vertically to avoid opening off screen (even it if means oerlapping the target element)
				if (autoPosition === true) {
					if (posX + menuBody.offsetWidth > docWidth) {
						// Test if sub-contextmenu overflows window width
						menuBody.style.left = String(Math.max(5, posX - menuBody.offsetWidth)) + 'px'
						animationDirection.horizontal = "right"
					}

					if (menuBody.offsetHeight > docHeight) {
						// Test if contextmenu height larger than the window height
						menuBody.style.top = 0
						menuBody.style.overflowY = 'auto'
						menuBody.style.overflowX = 'hidden'
						menuBody.style.height = docHeight - 20 + 'px'
						animationDirection.vertical = "top"
					} else if (posY + menuBody.offsetHeight > docHeight) {
						animationDirection.vertical = "bottom"
						// Test if context-menu overflows window height
						if (targetElementHeight == null) {
							// If not trying to avoid overlap with target element (usually with a regular right-click)
							menuBody.style.top = Math.max(posY - menuBody.offsetHeight, 0) + 'px'
						} else {
							// If avoiding overlap with target element (usually when displaying a menu-dropdown)
							menuBody.style.top = Math.max(posY - targetElementHeight - menuBody.offsetHeight - this.dropdownMenuDistance, 0) + 'px' // 999
						}
					}
				}
			} else {
				// If menu is a sub-context-menu
				let menuParentDimensions = menuParent.getBoundingClientRect()
				let thisMenuDimensions = menuBody.getBoundingClientRect()
				// Account for the pre-scaling of the element prior to the reveal animation
				thisMenuDimensions.width /= 0.85
				thisMenuDimensions.height /= 0.85

				// Test if sub-context-menu overflows window width
				if (thisMenuDimensions.left + thisMenuDimensions.width > docWidth) {
					menuBody.style.left = Math.max(-menuParent.offsetLeft - thisMenuDimensions.width, -menuParentDimensions.x) + 'px'
					menuBody.style.marginLeft = "7px"
					animationDirection.horizontal = "right"
				} else {
					menuBody.style.marginLeft = "-7px"
					animationDirection.horizontal = "left"
				}

				if (thisMenuDimensions.height > docHeight) {
					// Test if sub-context-menu height is larger than the window height
					menuBody.style.top = -thisMenuDimensions.top + 'px'
					menuBody.style.overflowY = 'auto'
					menuBody.style.overflowX = 'hidden'
					menuBody.style.height = docHeight - 20 + 'px'
					animationDirection.vertical = "top"
				} else if (thisMenuDimensions.height < docHeight && thisMenuDimensions.height > docHeight / 2) {
					// Test if the sub-context-menu height is smaller than the window height AND larger than half of window height
					if (thisMenuDimensions.top - docHeight / 2 >= 0) {
						// If sub-context-menu is closer to bottom of the screen
						menuBody.style.top = docHeight - thisMenuDimensions.top - thisMenuDimensions.height - 40 + "px"
						animationDirection.vertical = "bottom"
					} else {
						//If sub-context-menu is closer to top of the screen
						menuBody.style.top = -thisMenuDimensions.top + 'px'
						animationDirection.vertical = "top"
					}
				} else if (thisMenuDimensions.top + thisMenuDimensions.height > docHeight) {
					// Test if sub-context-menu overflows window height
					menuBody.style.top = -thisMenuDimensions.height + menuParentDimensions.height + 'px'
					animationDirection.vertical = "bottom"
				}

			}

			if (menuAnimation === true) {
				if (isMobileView === false) {
					menuBody.style.transformOrigin = (this.forceOpenAnimationDirection.vertical || animationDirection.vertical) + " " + (this.forceOpenAnimationDirection.horizontal || animationDirection.horizontal)
				}
				requestAnimationFrame(() => { menuBody.classList.toggle("visible", true) })
			} else {
				menuBody.classList.toggle("no-animation", true)
				menuBody.classList.toggle("visible", true)
			}

			if (isMobileView === true) {
				this.InitializeSwipeEvents(menuBody)
			}

		} catch (e) {
			this.ForceClose()
		}
	}

	InitializeSwipeEvents(menuBody) {
		menuBody.ontouchstart = (e) => {
			if (menuBody.querySelector(".contextmenu-container") != null) { e.preventDefault() }
			this.swipePositions.startY = e.touches[0].clientY
			this.swipePositions.scrollStarted = false
		}

		menuBody.ontouchmove = (e) => {
			if (menuBody.querySelector(".contextmenu-container") != null) { e.preventDefault() }
			if (menuBody.scrollTop > 20 || this.swipePositions.scrollStarted === true) {
				this.swipePositions.scrollStarted = true
				menuBody.style.transform = null
				menuBody.classList.toggle("isDragging", false)
				return
			}
			menuBody.classList.toggle("isDragging", true)
			this.swipePositions.currentY = e.touches[0].clientY
			let translateY = this.swipePositions.currentY - this.swipePositions.startY
			// // Prevent the menu from going beyond the boundaries
			if (translateY <= 0) { translateY = 0 }
			// Move the menu along with the finger
			menuBody.style.transform = `translate3d(0px, ${translateY}px, 0px)`
		}

		menuBody.ontouchend = (e) => {
			if (menuBody.querySelector(".contextmenu-container") != null) { e.preventDefault() }
			if (menuBody.classList.contains("isDragging") === false) { return }

			const menuPosition = parseInt(menuBody.style.transform.replace("translate3d(0px, ", "").replace("px, 0px)", ""))
			document.querySelectorAll(".contextmenu-container").forEach((menu) => {
				menu.style.transform = null
				menu.classList.toggle("isDragging", false)
			})
			// If the swipe is greater than the minimum swipe distance, then close it, otherwise bounce it back open
			if (menuPosition > this.swipePositions.minimumSwipeDistance) {
				if (menuBody.parentElement === document.body) {
					this.ForceClose()
				} else {
					this.CloseAllSubMenus(menuBody.parentElement.closest(".contextmenu-container"))
				}
			}
		}
	}

	/** Programmatically force the menu and its children to close */
	ForceClose() {
		this.topLevelMenu = null
		this.CloseAllContextMenus(true)
	}

	/** Programmatically force the sub-menus of a given menu to close */
	CloseAllSubMenus(targetMenu) {
		targetMenu.childNodes.forEach((nodeItem) => {
			nodeItem.querySelectorAll('.contextmenu-container').forEach((nodeSubMenu) => {
				this.#disposeMenuItemEvents(nodeSubMenu)
				// Clean up the reference to the JavaScript object class
				nodeSubMenu.classReference = null
				nodeSubMenu.remove()
			})
			nodeItem.classList.toggle("contextmenu-item-focus", false)
		})
		targetMenu.focus()
		targetMenu.setAttribute("data-keydown-events-enabled", "true")
	}

	// Global function to force close all context menus
	CloseAllContextMenus(runCallbacks) {
		try {
			if (runCallbacks === true) {
				for (let callback of Object.values(this.menuCloseCallbacks)) {
					callback()
				}
			}

			const isMobileView = this.allowMobileView === true && window.innerWidth < this.mobileViewBreakpoint
			if (isMobileView === true) {
				const pageMask = document.querySelector(".contextmenu-pageMask")
				if (pageMask != null) {
					pageMask.addEventListener("transitionend", (e) => { pageMask.remove() }, { once: true })
					pageMask.classList.toggle("visible", false)
				}
			}

			document.querySelectorAll(".contextmenu-container").forEach((menuContainer) => {
				this.#disposeMenuItemEvents(menuContainer)
				// Clean up the reference to the JavaScript object class
				menuContainer.classReference = null
				if (isMobileView === true) {
					menuContainer.addEventListener("transitionend", () => { menuContainer.remove() }, { once: true })
					menuContainer.classList.toggle("visible", false)
				} else {
					menuContainer.remove()
				}
			})
			// Remove context menu focus styling from all elements
			document.querySelectorAll(".contextMenuFocus").forEach((e) => { e.classList.toggle("contextMenuFocus", false) })
			this.#toggleContextMenuLock(false)
		} catch { }
	}

	/** Remove the event listener to trigger this menu from the DOM. To simply force the menu closed, use the CloseAllContextMenus method instead */
	Destroy() {
		this.events.beforeRender = null
		this.events.afterRender = null
		this._menuOptions.forEach((option) => {
			if (option.hasOwnProperty("clickEvent")) {
				option["clickEvent"] = null
			}
		})
		this.menuCloseCallbacks = null
		if (this._clickListener != null) {
			document.removeEventListener("contextmenu", this._clickListener)
		}
		this.CloseAllContextMenus(true)
	}

	#disposeMenuItemEvents(menuContainer) {
		menuContainer.ontouchstart = null
		menuContainer.ontouchmove = null
		menuContainer.ontouchend = null
		menuContainer.querySelectorAll(".contextmenu-item").forEach((hoverArea) => {
			hoverArea.onmouseenter = null
			hoverArea.onmouseleave = null
			hoverArea.onmousemove = null
			hoverArea.parentElement.onclick = null
		})
	}

	/** 
 * Function to alter the behavior of certain DOM events while the context menu is open 
 * @param {Boolean} lock Whether to listen for events which will close the context menu or not
 **/
	#toggleContextMenuLock(lock) {
		try {
			if (lock) {
				if (this.contextMenuIsVisible === false || this.contextMenuIsVisible == null) {
					if (this.ignoreCloseMenuEvents == null) { this.ignoreCloseMenuEvents = [] }
					// Close all context menus if mouse click isn't inside .contextmenu-container
					if (this.ignoreCloseMenuEvents.includes("mousedown") === false) {
						this.eventListenerReferences.mousedown = (e) => { if (!e.target.closest('.contextmenu-container')) { this.CloseAllContextMenus(true) } }
						document.addEventListener("mousedown", this.eventListenerReferences.mousedown)
					}
					if (this.ignoreCloseMenuEvents.includes("keydown") === false) {
						// Close all context menus if escape key is pressed
						this.eventListenerReferences.keydown = (e) => { if (["Escape", "Cancel", "Clear"].includes(e.key)) { this.CloseAllContextMenus(true); e.preventDefault(); e.stopPropagation() } }
						document.addEventListener("keydown", this.eventListenerReferences.keydown)
					}
					if (this.ignoreCloseMenuEvents.includes("wheel") === false) {
						// Close all context menus if the scroll wheel is triggered
						this.eventListenerReferences.wheel = () => { this.CloseAllContextMenus(true) }
						document.addEventListener("wheel", this.eventListenerReferences.wheel)
					}
					if (this.ignoreCloseMenuEvents.includes("blur") === false) {
						// Close all context menus if the window loses focus
						this.eventListenerReferences.blur = () => { this.CloseAllContextMenus(true) }
						window.addEventListener("blur", this.eventListenerReferences.blur)
					}
					if (this.ignoreCloseMenuEvents.includes("resize") === false) {
						// Close all context menus if user resizes the window
						this.eventListenerReferences.resize = () => { this.CloseAllContextMenus(true) }
						window.addEventListener("resize", this.eventListenerReferences.resize)
					}
				}
			} else {
				document.removeEventListener("mousedown", this.eventListenerReferences.mousedown)
				document.removeEventListener("keydown", this.eventListenerReferences.keydown)
				document.removeEventListener("wheel", this.eventListenerReferences.wheel)
				window.removeEventListener("blur", this.eventListenerReferences.blur)
				window.removeEventListener("resize", this.eventListenerReferences.resize)
			}
			this.contextMenuIsVisible = lock
		} catch (e) {
			showErrorScreen(e)
		}
	}

	SendKeyCommand(menuBody, key) {
		if (document.body.contains(menuBody) === false) { return }
		if (menuBody.getAttribute("data-keydown-events-enabled") === "true") {
			let selectableItems = menuBody.querySelectorAll(".contextmenu-item:not(.disabled)")
			let hoveredItem = menuBody.querySelector(".hover:not(.disabled)")
			let hoveredItemIndex = Array.from(selectableItems).indexOf(hoveredItem)
			switch (key) {
				case "ArrowUp":
				case "PageUp":
					if (hoveredItem != null && hoveredItemIndex > -1) {
						hoveredItem.classList.toggle("hover", false)
						if (hoveredItemIndex === 0) {
							// If the top item is currently selected, then jump to the bottom
							selectableItems[selectableItems.length - 1].classList.toggle("hover", true)
						} else {
							// Select the item above the currently selected item
							selectableItems[hoveredItemIndex - 1].classList.toggle("hover", true)
						}
					} else {
						// If nothing is currently selected, then highlight the bottom item
						selectableItems[selectableItems.length - 1].classList.toggle("hover", true)
					}
					this.CloseAllSubMenus(menuBody)
					break
				case "ArrowDown":
				case "PageDown":
					if (hoveredItem != null && hoveredItemIndex > -1) {
						hoveredItem.classList.toggle("hover", false)
						if (hoveredItemIndex === selectableItems.length - 1) {
							// If the bottom item is currently selected, then jump to the top
							selectableItems[0].classList.toggle("hover", true)
						} else {
							// Select the item below the currently selected item
							selectableItems[hoveredItemIndex + 1].classList.toggle("hover", true)
						}
					} else {
						// If nothing is currently selected, then highlight the top item
						selectableItems[0].classList.toggle("hover", true)
					}
					this.CloseAllSubMenus(menuBody)
					break
				case "ArrowRight":
					// Dispatch an event to trigger the item's sub menu to open
					if (hoveredItem != null) {
						hoveredItem.dispatchEvent(new Event("open submenu on arrow key"))
					} else {
						selectableItems[0].classList.toggle("hover", true)
					}
					break
				case "ArrowLeft":
					let parentMenu = menuBody.parentElement.closest(".contextmenu-container")
					if (parentMenu != null) {
						// CLosing a submenu triggers a cascade effect of closing all additional menus below it. Use setTimeout to debounce and prevent this
						setTimeout(() => {
							parentMenu.setAttribute("data-keydown-events-enabled", "true")
						}, 100)
						// Close the topmost submenu
						this.CloseAllSubMenus(parentMenu)
						parentMenu.focus()
					}
					break
				case "Enter":
				case "Tab":
				case "Accept":
					if (hoveredItem != null) {
						if (hoveredItem.querySelector(".contextmenu-caret")) {
							hoveredItem.dispatchEvent(new Event("open submenu on arrow key"))
						} else {
							hoveredItem.click()
						}
					} else {
						selectableItems[0].classList.toggle("hover", true)
					}
					break
				case "Escape":
				case "Cancel":
				case "Clear":
					if (this.ignoreCloseMenuEvents.includes("keydown") === false) {
						this.CloseAllContextMenus(true)
					}
					break
			}
		}
	}

}

const subMenuTriggerTypes = {
	mouseenter: { delay: 100, defaultSelection: false },
	mouseclick: { delay: 0, defaultSelection: false },
	arrowkey: { delay: 0, defaultSelection: true }
}