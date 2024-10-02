import { RemoveAllChildren } from "../utils.js"
import { AlertBanner } from "./alert-banner.js"

export class ConfirmationModal extends HTMLElement {
	constructor() {
		super()
	}

	connectedCallback() {
		this.innerHTML = `
			<div class="modal fade" id="${crypto.randomUUID()}" data-bs-backdrop="static" data-bs-keyboard="true" tabindex="-1" aria-hidden="true">
				<div class="modal-dialog modal-dialog-centered">
					<div class="modal-content card">
					<div class="modal-header">
						<h1 class="modal-title fs-5">
							<!-- Modal Title -->
						</h1>
						<button type="button" name="close" class="btn-close btn-sm" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body py-4">
						<!-- Modal Body -->
					</div>
					<div class="modal-footer">
						<button style="min-width: 100px;" type="button" name="cancel" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
						<button style="min-width: 100px;" type="button" name="submit" class="btn btn-primary" data-bs-dismiss="modal">Submit</button>
					</div>
					</div>
				</div>
				<alert-banner></alert-banner>
			</div>
		`

		this.titleElement = this.querySelector(".modal-title")
		this.bodyElement = this.querySelector(".modal-body")
		this.closeButton = this.querySelector("button[name='close']")
		this.cancelButton = this.querySelector("button[name='cancel']")
		this.submitButton = this.querySelector("button[name='submit']")

		/** @type {AlertBanner} */
		this.alertBanner = this.querySelector("alert-banner")

		this.bootstrapModalObject = new bootstrap.Modal(this.querySelector(".modal"))

		this.bootstrapModalObject._element.onkeydown = (e) => {
			if (e.key === "Enter") {
				e.preventDefault()
				this.submitButton.click()
			}
		}
	}

	Show(title, bodyHtml, submitCallback, cancelCallback, submitButtonText, cancelButtonText, autoDismissOnSubmit = true, autoDismissOnCancel = true) {
		return new Promise((resolve) => {
			try {
				if (autoDismissOnSubmit === false) { this.submitButton.removeAttribute("data-bs-dismiss") }
				if (autoDismissOnCancel === false) {
					this.closeButton.removeAttribute("data-bs-dismiss")
					this.cancelButton.removeAttribute("data-bs-dismiss")
				}

				this.titleElement.innerText = title
				this.bodyElement.innerHTML = bodyHtml
				this.cancelButton.innerText = cancelButtonText
				this.submitButton.innerText = submitButtonText
				this.cancelButton.classList.toggle("hidden", (cancelButtonText == null || cancelButtonText === ""))
				this.submitButton.classList.toggle("hidden", (submitButtonText == null || submitButtonText === ""))
				if (cancelCallback != null) {
					this.cancelButton.onclick = () => { cancelCallback() }
					this.closeButton.onclick = () => { cancelCallback() }
				}
				if (submitCallback != null) {
					this.submitButton.onclick = () => { submitCallback() }
				}

				// Focus the first input element once the modal is shown (if there is one)
				this.bootstrapModalObject._element.addEventListener("shown.bs.modal", (e) => {
					e.target.querySelector("input[type='text']")?.focus()
				}, { once: true })

				this.bootstrapModalObject._element.addEventListener("hidden.bs.modal", () => {
					this.#reset()
					resolve()
				}, { once: true })
				this.bootstrapModalObject.show()
			} catch {
				resolve()
			}
		})
	}

	Hide() {
		this.bootstrapModalObject.hide()
	}

	#reset() {
		this.alertBanner.Toggle(false)
		this.titleElement.innerText = ""
		this.cancelButton.innerText = "Cancel"
		this.submitButton.innerText = "Submit"
		this.closeButton.setAttribute("data-bs-dismiss", "modal")
		this.cancelButton.setAttribute("data-bs-dismiss", "modal")
		this.submitButton.setAttribute("data-bs-dismiss", "modal")
		this.closeButton.onclick = null
		this.cancelButton.onclick = null
		this.submitButton.onclick = null
		RemoveAllChildren(this.bodyElement)
	}

	disconnectedCallback() {
		this.cancelButton.onclick = null
		this.submitButton.onclick = null
	}
}

window.customElements.define("confirmation-modal", ConfirmationModal)