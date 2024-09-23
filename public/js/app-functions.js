import { AudioPlayer } from "./components/audio-player.js"
import { AlertBanner } from "./index.js"
import { isNullOrWhiteSpace } from "./utils.js"

let temporarySongCache = {}

/** @type {AudioPlayer} */
const audioPlayer = document.querySelector("audio-player")

export function PlaySongFromLibrary(libraryUuid) {
	return new Promise((resolve) => {
		try {
			if(isNullOrWhiteSpace(libraryUuid)){ throw new Error("library uuid cannot be empty")}
			audioPlayer.SetSource(libraryUuid)
			audioPlayer.audioElement.play()
			resolve()
		} catch (e) {
			AlertBanner.Toggle(true, true, "Error playing song", 7000, AlertBanner.bannerColors.error)
			resolve(e)
		}
	})
}

export function PlaySongFromYouTube(videoId) {
	return new Promise(async (resolve) => {
		try {
			if(isNullOrWhiteSpace(videoId)){ throw new Error("video id cannot be empty") }
			let audioUrl
			if (temporarySongCache[videoId] == null) {
				const res = await fetch("/play-temporary-song?videoId=" + videoId)
				if (res.status >= 400) { throw new Error(res.statusText) }
				audioUrl = URL.createObjectURL(await res.blob())
				temporarySongCache[videoId] = audioUrl
			} else {
				audioUrl = temporarySongCache[videoId]
			}
			audioPlayer.audioElement.src = audioUrl
			audioPlayer.audioElement.play()
			resolve()
		} catch (e) {
			AlertBanner.Toggle(true, true, "Error playing song", 7000, AlertBanner.bannerColors.error)
			resolve(e)
		}
	})
}