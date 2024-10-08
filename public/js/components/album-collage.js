
export class AlbumCollage extends HTMLElement {
	constructor(image1, image2, image3) {
		super()

		this.innerHTML = `
			<div>
				<img src="${image1}">
			</div>
			<div>
				<img src="${image2}">
			</div>
			<div>
				<img src="${image3}">
			</div>
		`
	}

	async connectedCallback() {
		const img1 = this.querySelector("img:nth-child(1)")
		const img2 = this.querySelector("img:nth-child(2)")
		const img3 = this.querySelector("img:nth-child(3)")
		if (img1.src == null && this.dataset.img1 != null) { img1.src = this.dataset.img1 }
		if (img2.src == null && this.dataset.img2 != null) { img2.src = this.dataset.img2 }
		if (img3.src == null && this.dataset.img3 != null) { img3.src = this.dataset.img3 }
	}

}

customElements.define("album-collage", AlbumCollage)