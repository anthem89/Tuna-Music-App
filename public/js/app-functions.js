import { AudioPlayer } from "./components/audio-player.js"
import { AlertBanner, SessionExpired } from "./index.js"
import { isNullOrWhiteSpace } from "./utils.js"
import { TrackData } from "./components/track-data.js"

let temporarySongCache = {}

/** @type {AudioPlayer} */
const audioPlayer = document.querySelector("audio-player")

export function PlaySongFromLibrary(libraryUuid) {
	return new Promise((resolve) => {
		try {
			if (isNullOrWhiteSpace(libraryUuid)) { throw new Error("library uuid cannot be empty") }
			audioPlayer.SetSource(libraryUuid)
			audioPlayer.audioElement.play()
			resolve()
		} catch (e) {
			AlertBanner.Toggle(true, true, "Error playing song", 7000, AlertBanner.bannerColors.error)
			resolve(e)
		}
	})
}

export function CacheSongFromYouTube(videoId) {
	return new Promise(async (resolve) => {
		try {
			if (isNullOrWhiteSpace(videoId)) { throw new Error("video id cannot be empty") }
			let audioUrl
			if (temporarySongCache[videoId] == null) {
				const res = await fetch("/play-temporary-song?videoId=" + videoId)
				if (res.redirected) {
					SessionExpired()
				} else if (res.status >= 400) {
					throw new Error(res.statusText)
				}
				audioUrl = URL.createObjectURL(await res.blob())
				temporarySongCache[videoId] = audioUrl
			} else {
				audioUrl = temporarySongCache[videoId]
			}
			resolve(audioUrl)
		} catch (e) {
			resolve(null)
		}
	})
}

export function PlaySongFromYouTube(videoId) {
	return new Promise(async (resolve) => {
		try {
			if (isNullOrWhiteSpace(videoId)) { throw new Error("video id cannot be empty") }
			const audioUrl = await CacheSongFromYouTube(videoId)
			if (audioUrl == null) { throw new Error("error downloading song from YouTube") }
			audioPlayer.audioElement.src = audioUrl
			audioPlayer.audioElement.play()
			resolve()
		} catch (e) {
			AlertBanner.Toggle(true, true, "Error playing song", 7000, AlertBanner.bannerColors.error)
			resolve(e)
		}
	})
}

/** @param {TrackData} trackData */
export function DownloadSongToLibrary(trackData) {
	return new Promise(async (resolve, reject) => {
		try {
			const reqHeader = { "Content-Type": "application/json" }
			const res = await fetch("/download-song", { method: "POST", body: JSON.stringify(trackData), headers: reqHeader })
			if (res.redirected) { SessionExpired() }
			const resJson = await res.json()
			if (resJson["libraryUuid"] == null) {
				throw new Error(resJson.error || "Error downloading song")
			}
			resolve(resJson["libraryUuid"])
		} catch (e) {
			reject(e)
		}
	})
}

/** @param {String} libraryUuidArray */
export function RemoveSongsFromLibrary(libraryUuidArray) {
	return new Promise(async (resolve, reject) => {
		try {
			if (Array.isArray(libraryUuidArray) === false || libraryUuidArray.length === 0) {
				throw new Error("You must provide at least one song id")
			}
			const reqHeader = { "Content-Type": "application/json" }
			const res = await fetch("/user-library/delete-song", { method: "DELETE", body: JSON.stringify({ idArray: libraryUuidArray }), headers: reqHeader })
			if (res.redirected) { SessionExpired() }
			const resJson = await res.json()
			const deletionCount = resJson["deletionCount"]
			if (deletionCount == null || deletionCount === 0) {
				throw new Error(resJson.error || "Error deleting song(s)")
			}
			resolve(deletionCount)
		} catch (e) {
			reject(e)
		}
	})
}