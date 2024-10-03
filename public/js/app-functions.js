import { AudioPlayerElement } from "./index.js"
import { AlertBanner, SessionExpired, ConfirmationModal } from "./index.js"
import { isNullOrWhiteSpace } from "./utils.js"
import { TrackData, PlaylistData } from "./components/data-models.js"

const pendingDownloads = {}
const temporarySongCache = {}
/** @type {PlaylistData[]} */
export let PlaylistCache = []
GetUserPlaylists()

export function CacheSongFromYouTube(videoId) {
	return new Promise(async (resolve) => {
		try {
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

/** @param {TrackData} trackData */
export function DownloadSongToLibrary(trackData) {
	return new Promise(async (resolve, reject) => {
		try {
			if (pendingDownloads.hasOwnProperty(trackData.video_id)) {
				reject("Download already in progress")
				return
			}
			pendingDownloads[trackData.video_id] = true
			const reqHeader = { "Content-Type": "application/json" }
			const res = await fetch("/download-song", { method: "POST", body: JSON.stringify(trackData), headers: reqHeader })
			if (res.redirected) { SessionExpired() }
			const resJson = await res.json()
			if (resJson["libraryUuid"] == null) {
				throw new Error(resJson.error || "Error downloading song")
			}
			delete pendingDownloads[trackData.video_id]
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
			const res = await fetch("/user-library/delete-songs", { method: "DELETE", body: JSON.stringify({ idArray: libraryUuidArray }), headers: reqHeader })
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

/** @returns {PlaylistData[]} */
export function GetUserPlaylists() {
	return new Promise(async (resolve, reject) => {
		try {
			const res = await fetch("/playlists", { method: "GET" })
			const resJson = await res.json()
			PlaylistCache = resJson.map((data) => new PlaylistData(data))
			resolve(PlaylistCache)
		} catch (e) {
			reject(e)
		}
	})
}

export function OpenCreatePlaylistDialog({ addSongIdOnSubmit } = {}) {
	const html = `
		<div class="d-flex flex-column">
			<input id="playlist-name-input" type="text" class="flex-grow-1 mb-3" placeholder="Playlist name" autocomplete="off" maxlength="50"">
			<textarea id="playlist-description-input" class="flex-grow-1" style="height: 75px;" placeholder="Description" maxlength="150"></textarea>
		</div>
	`
	const submitCallback = async () => {
		const titleInput = ConfirmationModal.querySelector("#playlist-name-input").value.trim()
		const descriptionInput = ConfirmationModal.querySelector("#playlist-description-input").value
		if (titleInput === "") {
			ConfirmationModal.alertBanner.Toggle(true, true, "Playlist name cannot be empty", 7000, ConfirmationModal.alertBanner.bannerColors.caution)
			return
		}
		ConfirmationModal.Hide()

		try {
			const reqHeader = { "Content-Type": "application/json" }
			const body = {
				title: titleInput,
				description: descriptionInput
			}
			const res = await fetch("/playlists/create-playlist", { method: "POST", body: JSON.stringify(body), headers: reqHeader })
			const resJson = await res.json()
			/** @type {PlaylistData} */
			const newPlaylistData = resJson.playlistData
			if (resJson.status === "success" && newPlaylistData != null) {
				// Add the newly created playlist to the playlist cache
				PlaylistCache.unshift(newPlaylistData)
				// If user requested to add a song when creating the playlist
				if (isNullOrWhiteSpace(addSongIdOnSubmit) === false) {
					await AddSongsToPlaylist(newPlaylistData.id, [addSongIdOnSubmit])
				} else {
					AlertBanner.Toggle(true, true, "Successfully created playlist", 7000, AlertBanner.bannerColors.success)
				}
			} else {
				throw new Error(resJson?.status)
			}
		} catch (e) {
			AlertBanner.Toggle(true, true, "Error creating playlist", 7000, AlertBanner.bannerColors.error)
		}
	}
	ConfirmationModal.Show("Create new playlist", html, submitCallback, null, "Create", "Cancel", false, true)
}

/** @param {TrackData[]} */
export function AddSongsToPlaylist(playlistId, trackDataArray) {
	return new Promise(async (resolve, reject) => {
		try {
			const reqHeader = { "Content-Type": "application/json" }
			const body = {
				playlistId: playlistId,
				songIds: trackDataArray
			}
			const res = await fetch("/playlists/add-songs", { method: "POST", body: JSON.stringify(body), headers: reqHeader })
			const resJson = await res.json()
			const plural = resJson.addedCount > 1 ? "s" : ""
			if (resJson.addedCount > 0) {
				AlertBanner.Toggle(true, true, "Added " + resJson.addedCount + " song" + plural + " to playlist", 7000, AlertBanner.bannerColors.success)
			} else {
				AlertBanner.Toggle(true, true, "Selected song(s) already on playlist", 7000, AlertBanner.bannerColors.info)
			}
		} catch (e) {
			AlertBanner.Toggle(true, true, "Error adding song(s) to playlist", 7000, AlertBanner.bannerColors.error)
		}
		resolve()
	})
}