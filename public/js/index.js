import { DiscoverScreen } from "./screens/discover-screen.js";
import { LibraryScreen } from "./screens/library-screen.js";


export function SwitchScreen(screen) {
	const appBody = document.querySelector("#app-body")
	appBody.innerHTML = ""
	appBody.insertAdjacentElement("beforeend", screen)
}

document.querySelector(".screen-link[name='discover-songs']").onclick = () => {
	SwitchScreen(new DiscoverScreen())
}
document.querySelector(".screen-link[name='my-library']").onclick = () => {
	SwitchScreen(new LibraryScreen())
}