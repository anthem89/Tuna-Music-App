export class AlertBanner extends HTMLElement {
	constructor() {
		super()
		this.timer
		this.bannerColors = {
			error: "#ff4e4e",
			caution: "#DAA520",
			info: "#4a90ec",
			success: "#43cfa8"
		}
		this.manualCloseButton
	}

	// Callback to run once component mounts to DOM
	connectedCallback() {
		this.classList.toggle("alertBanner", true)
		this.innerHTML = `
			<div>
				<span></span>
				<i class="btn-alertBannerClose bi bi-x"></i>
			</div>
		`
		this.manualCloseButton = this.querySelector(".btn-alertBannerClose")
		this.manualCloseButton.onclick = () => {
			clearTimeout(this.timer)
			this.Toggle(false)
		}
		this.alertSpan = this.querySelector("span")

		this.ontransitionend = () => {
			if (this.classList.contains("active") === false) {
				this.alertSpan.innerText = ""
			}
		}
	}

	disconnectedCallback() {
		this.ontransitionend = null
		this.manualCloseButton.onclick = null
	}

	/**
	 * @param {Boolean} show
	 * @param {Boolean} allowManualClose
	 * @param {String} alertText
	 * @param {Number} timeOutInMilliseconds
	 */
	Toggle(show, allowManualClose, alertText, timeOutInMilliseconds = null, backgroundColor = this.bannerColors.error) {
		const manualCloseButton = this.querySelector(".btn-alertBannerClose")

		if (allowManualClose === false) {
			manualCloseButton.style.display = "none"
		} else {
			manualCloseButton.style.display = null
		}
		if (show === true) {
			this.firstElementChild.style.backgroundColor = backgroundColor
			this.alertSpan.innerText = alertText || ""
		}
		this.classList.toggle("active", show)

		if (show === true) {
			if (timeOutInMilliseconds != null) {
				clearTimeout(this.timer)
				this.timer = setTimeout(() => {
					this.timer = null
					this.classList.toggle("active", false)
				}, timeOutInMilliseconds)
			} else {
				clearTimeout(this.timer)
			}
		} else {
			clearTimeout(this.timer)
		}
	}
}

window.customElements.define("alert-banner", AlertBanner)