export class MediaTile extends HTMLElement {
	constructor(image, primaryText, secondaryText) {
		super()

		const html = `
			<div class="media-tile-image">
				<img src="${image || "../../assets/img/no-album-art.png"}">
				<div class="loading-spinner">
					<div class="spinner-border" role="status"></div>
				</div>
			</div>
			<div class="media-tile-text-div">
				<span class="media-tile-primary-text">${primaryText}</span>
				<span class="media-tile-secondary-text">${secondaryText}</span>
			</div>
			<i class="btn-open-mobile-context-menu bi bi-three-dots-vertical"></i>
		`
		this.innerHTML = DOMPurify.sanitize(html)
		this.isLoading = false
	}

	connectedCallback() {
		this.classList.add("media-tile")
		this.imageElement = this.querySelector("img")
		this.imageElement.onerror = () => {
			this.imageElement.src = "../../assets/img/no-album-art.png"
		}
		this.primaryTextElement = this.querySelector(".media-tile-primary-text")
		this.secondaryTextElement = this.querySelector(".media-tile-secondary-text")
	}

	ToggleLoadingMask(isLoading) {
		this.classList.toggle("loading", isLoading)
		this.isLoading = isLoading
	}

	disconnectedCallback() {
		this.imageElement.onerror = null
	}
}







