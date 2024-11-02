import { AlertBanner, SessionExpired, ConfirmationModal, AudioPlayerElement, CurrentScreen, SwitchToScreen } from "./index.js"
import { isNullOrWhiteSpace } from "./utils.js"
import { TrackData, PlaylistData } from "./components/data-models.js"
import { AppSettings } from "./screens/settings-screen.js"
import { PlaylistTile } from "./components/playlist-tile.js"

const pendingDownloads = {}
const temporarySongCache = {}
/** @type {PlaylistData[]} */
export let PlaylistCache = []

export function CacheSongFromYouTube(videoId) {
	return new Promise(async (resolve) => {
		try {
			let audioUrl
			if (temporarySongCache[videoId] == null) {
				const quality = AppSettings.preferHighQualityDownload ? "high" : "low"
				const res = await fetch("/play-temporary-song?videoId=" + videoId + "&quality=" + quality)
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
			console.error(e)
			resolve(null)
		} finally {
			CleanupTemporarySongBlobCache()
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
			const quality = AppSettings.preferHighQualityDownload ? "high" : "low"
			const res = await fetch("/download-song", { method: "POST", body: JSON.stringify({ trackData: trackData, quality: quality }), headers: reqHeader })
			if (res.redirected) { SessionExpired() }
			const resJson = await res.json()
			if (resJson["libraryUuid"] == null) {
				throw new Error(resJson.error || "Error downloading song")
			}
			delete pendingDownloads[trackData.video_id]
			resolve(resJson["libraryUuid"])
		} catch (e) {
			console.error(e)
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
			console.error(e)
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
			console.error(e)
			reject(e)
		}
	})
}

export function GetPlaylistTrackDataArray(playlistId) {
	return new Promise(async (resolve, reject) => {
		try {
			const res = await fetch("/playlists/playlist-songs?playlistId=" + playlistId)
			const trackDataArray = await res.json()
			resolve(trackDataArray)
		} catch (e) {
			console.error(e)
			reject(e)
		}
	})
}

/**
 * @param {String[]} addSongIdsOnSubmit An array of song ids that will get immediately populated into the playlist once it is created
 * @param {String} action Options are "create", "copy", "edit"
 * @param {PlaylistTile} targetPlaylistTile If editing a playlist's attributes, provide the target PlaylistTile
 */
export function OpenPlaylistAttributesDialog(addSongIdsOnSubmit, action, targetPlaylistTile) {
	let modalTitle
	switch (action) {
		case "create":
			modalTitle = "Create new playlist"
			break
		case "copy":
			modalTitle = "Copy to new playlist"
			break
		case "edit":
			modalTitle = "Edit playlist attributes"
			break
	}
	const modalBodyHtml = `
		<div class="d-flex flex-column">
			<input id="playlist-name-input" type="text" class="flex-grow-1 mb-3" placeholder="New playlist name" autocomplete="off" spellcheck="false" maxlength="50" value="${targetPlaylistTile?.playlistData.title || ""}">
			<textarea id="playlist-description-input" class="flex-grow-1" style="height: 75px;" placeholder="Description (optional)" spellcheck="false" maxlength="150">${targetPlaylistTile?.playlistData.description || ""}</textarea>
		</div>
	`
	const createPlaylistCallback = async (playlistTitle, playlistDescription) => {
		try {
			const reqHeader = { "Content-Type": "application/json" }
			const body = {
				title: playlistTitle,
				description: playlistDescription
			}
			const res = await fetch("/playlists/create-playlist", { method: "POST", body: JSON.stringify(body), headers: reqHeader })
			const resJson = await res.json()
			/** @type {PlaylistData} */
			const newPlaylistData = resJson.playlistData
			if (resJson.status === "success" && newPlaylistData != null) {
				// Add the newly created playlist to the playlist cache
				PlaylistCache.unshift(newPlaylistData)
				// If user requested to add a song when creating the playlist
				if (Array.isArray(addSongIdsOnSubmit) === true) {
					await AddSongsToPlaylist(newPlaylistData.id, addSongIdsOnSubmit)
				} else {
					AlertBanner.Toggle(true, true, "Successfully created new playlist", 7000, AlertBanner.bannerColors.success)
				}
			} else {
				throw new Error(resJson?.status)
			}
		} catch (e) {
			console.error(e)
			AlertBanner.Toggle(true, true, "Error creating new playlist", 7000, AlertBanner.bannerColors.error)
		}
	}
	const editPlaylistCallback = async (playlistTitle, playlistDescription) => {
		try {
			const newPlaylistData = structuredClone(targetPlaylistTile.playlistData)
			newPlaylistData.title = playlistTitle
			newPlaylistData.description = playlistDescription
			// Write the changes to the database
			const reqHeader = { "Content-Type": "application/json" }
			const res = await fetch("/playlists/edit-playlist-properties", { method: "POST", body: JSON.stringify({ playlistData: newPlaylistData }), headers: reqHeader })
			const resJson = await res.json()
			if (resJson.status === "success") {
				targetPlaylistTile.playlistData = newPlaylistData
				// Update the visual elements on the target playlist tile
				targetPlaylistTile.UpdatePlaylistAttributes(newPlaylistData)
				PlaylistCache = PlaylistCache.map((playlistData) => playlistData.id === newPlaylistData.id ? newPlaylistData : playlistData)
				AlertBanner.Toggle(true, true, "Successfully edited playlist", 7000, AlertBanner.bannerColors.success)
			} else {
				throw new Error(resJson.error)
			}
		} catch (e) {
			console.error(e)
			AlertBanner.Toggle(true, true, "Error editing playlist", 7000, AlertBanner.bannerColors.error)
		}
	}
	const submitCallback = async () => {
		const titleInput = ConfirmationModal.querySelector("#playlist-name-input").value.trim()
		const descriptionInput = ConfirmationModal.querySelector("#playlist-description-input").value
		if (titleInput === "") {
			ConfirmationModal.alertBanner.Toggle(true, true, "New playlist name cannot be empty", 7000, ConfirmationModal.alertBanner.bannerColors.caution)
			return
		}
		ConfirmationModal.Hide()
		if (["create", "copy"].includes(action)) {
			createPlaylistCallback(titleInput, descriptionInput)
		} else {
			editPlaylistCallback(titleInput, descriptionInput)
		}
	}
	ConfirmationModal.Show(modalTitle, DOMPurify.sanitize(modalBodyHtml), submitCallback, null, "Submit", "Cancel", false, true)
}

/**
 * @param {String} playlistId
 * @param {String[]} trackIdArray
 */
export function AddSongsToPlaylist(playlistId, trackIdArray) {
	return new Promise(async (resolve, reject) => {
		try {
			const reqHeader = { "Content-Type": "application/json" }
			const body = {
				playlistId: playlistId,
				songIds: [...new Set(trackIdArray)] // Remove duplicates, keeping the first unique occoruance of each value
			}
			const res = await fetch("/playlists/add-songs", { method: "POST", body: JSON.stringify(body), headers: reqHeader })
			const resJson = await res.json()
			const plural = resJson.addedCount !== 1 ? "s" : ""
			if (resJson.addedCount > 0) {
				AlertBanner.Toggle(true, true, "Added " + resJson.addedCount + " song" + plural + " to playlist", 7000, AlertBanner.bannerColors.success)
			} else {
				AlertBanner.Toggle(true, true, "Selected song(s) already on playlist", 7000, AlertBanner.bannerColors.info)
			}
			resolve(true)
		} catch (e) {
			console.error(e)
			AlertBanner.Toggle(true, true, "Error adding song(s) to playlist", 7000, AlertBanner.bannerColors.error)
			resolve(false)
		}
	})
}

/**
 * @param {String} playlistId
 * @param {String[]} trackIdArray
 */
export function RemoveSongsFromPlaylist(playlistId, trackIdArray) {
	return new Promise(async (resolve, reject) => {
		try {
			const reqHeader = { "Content-Type": "application/json" }
			const body = {
				playlistId: playlistId,
				songIds: trackIdArray
			}
			const res = await fetch("/playlists/remove-songs", { method: "POST", body: JSON.stringify(body), headers: reqHeader })
			const resJson = await res.json()
			const plural = resJson.removedCount !== 1 ? "s" : ""
			if (resJson.removedCount > 0) {
				AlertBanner.Toggle(true, true, "Removed " + resJson.removedCount + " song" + plural + " from playlist", 7000, AlertBanner.bannerColors.success)
			} else {
				throw new Error("Database returned 0 songs removed")
			}
			resolve(true)
		} catch (e) {
			console.error(e)
			AlertBanner.Toggle(true, true, "Error removing song(s) from playlist", 7000, AlertBanner.bannerColors.error)
			resolve(false)
		}
	})
}

/** @param {String[]} playlistIdArray */
export function DeletePlaylists(playlistIdArray) {
	return new Promise(async (resolve, reject) => {
		try {
			const reqHeader = { "Content-Type": "application/json" }
			const res = await fetch("/playlists/delete-playlists", { method: "DELETE", body: JSON.stringify({ playlistIdArray: playlistIdArray }), headers: reqHeader })
			const resJson = await res.json()
			const plural = resJson.deletedCount !== 1 ? "s" : ""
			if (resJson.deletedCount > 0) {
				PlaylistCache = PlaylistCache.filter((playlistData) => playlistIdArray.includes(playlistData.id) === false)
				AlertBanner.Toggle(true, true, "Deleted " + resJson.deletedCount + " playlist" + plural, 7000, AlertBanner.bannerColors.success)
			} else {
				throw new Error("Database returned 0 playlists deleted")
			}
			resolve(true)
		} catch (e) {
			console.error(e)
			AlertBanner.Toggle(true, true, "Error deleting playlist(s)", 7000, AlertBanner.bannerColors.error)
			resolve(false)
		}
	})
}

/** @param {TrackData[]} trackDataArray */
export async function DownloadSongsToDevice(trackDataArray) {
	const totalCount = trackDataArray.length
	let failureCount = 0
	let promises = []
	for (const trackData of trackDataArray) {
		const promise = new Promise(async (resolve) => {
			let tempLink
			try {
				// Try to fetch the song from the client in-memory cache first (most economical)
				let bloblUrl = temporarySongCache[trackData.video_id]
				if (bloblUrl == null) {
					if (isNullOrWhiteSpace(trackData.id)) {
						if (isNullOrWhiteSpace(trackData.video_id)) { throw new Error("Cannot play song without either a library id or video id") }
						// Download the song directly from YouTube
						bloblUrl = await CacheSongFromYouTube(trackData.video_id)
						if (bloblUrl == null) { throw new Error("error downloading song from YouTube") }
					} else {
						// Download the song from the Tuna library
						const res = await fetch("./play-song?library-uuid=" + trackData.id)
						const resblob = await res.blob()
						bloblUrl = URL.createObjectURL(resblob)
						// Store the song in cache
						temporarySongCache[trackData.video_id] = bloblUrl
					}
				}
				tempLink = document.createElement("a")
				tempLink.href = bloblUrl
				tempLink.download = (trackData.artist || "Unknown Artist") + " - " + (trackData.title || "Unknown Title") + (trackData.file_format || ".mp3")
				document.body.appendChild(tempLink)
				tempLink.click()
			} catch (e) {
				console.error(e)
				failureCount++
			} finally {
				if (tempLink != null) { tempLink.remove() }
				CleanupTemporarySongBlobCache()
				resolve()
			}
		})
		promises.push(promise)
	}
	await Promise.all(promises)
	if (failureCount === totalCount) {
		AlertBanner.Toggle(true, true, "Error downloading song(s)", 7000, AlertBanner.bannerColors.error)
	} else {
		const successCount = totalCount - failureCount
		AlertBanner.Toggle(true, true, ("Successfully downloaded " + successCount + " / " + totalCount + " songs"), 7000, AlertBanner.bannerColors.success)
	}
}

// Only keep a limited number of blob ojects in the in-memory song cache to preserve memory on the user's device
export function CleanupTemporarySongBlobCache(numberOfItemsToKeep = 10) {
	const keys = Object.keys(temporarySongCache)
	if (keys.length > numberOfItemsToKeep) {
		keys.slice(numberOfItemsToKeep).forEach((key) => {
			URL.revokeObjectURL(temporarySongCache[key])
			delete temporarySongCache[key]
		})
	}
}


// Before quitting the app, store the current state in localstorage so it can be restored for the next session
// This includes saving the current queue, current track, current playlist, and current track progress
export function SaveSessionState(includeFullSessionState) {
	const sessionTrackData = {
		currentQueueIndex: AudioPlayerElement.currentQueueIndex,
		currentTrackProgress: AudioPlayerElement.audioElement.currentTime,
	}
	if (includeFullSessionState === true) {
		const sessionStateData = {
			trackQueue: AudioPlayerElement.trackQueue,
			currentPlaylistId: AudioPlayerElement.currentPlaylistId,
			currentScreenKey: ["searchMusic", "settings"].includes(CurrentScreen.screenKey) ? "home" : CurrentScreen.screenKey,
			currentScreenArgs: CurrentScreen.args,
		}
		localStorage.setItem("session-state", JSON.stringify(sessionStateData))
		localStorage.setItem("session-track-state", JSON.stringify(sessionTrackData))
	} else {
		localStorage.setItem("session-track-state", JSON.stringify(sessionTrackData))
	}
}

export function RestoreSessionState() {
	const appStateJson = localStorage.getItem("session-state")
	const trackStateJson = localStorage.getItem("session-track-state")

	if (isNullOrWhiteSpace(appStateJson) === false && isNullOrWhiteSpace(trackStateJson) === false) {
		const appState = JSON.parse(appStateJson)
		const trackState = JSON.parse(trackStateJson)

		AudioPlayerElement.UpdateQueue(appState.trackQueue, appState.currentPlaylistId)
		AudioPlayerElement.currentQueueIndex = trackState.currentQueueIndex
		AudioPlayerElement.audioElement.currentTime = trackState.currentTrackProgress

		if (AudioPlayerElement.trackQueue.length > 0) {
			AudioPlayerElement.currentTrack = AudioPlayerElement.trackQueue[AudioPlayerElement.currentQueueIndex]
			AudioPlayerElement.LoadSongInAudioPlayer(AudioPlayerElement.currentTrack)
			AudioPlayerElement.isPaused = true
		}
		SwitchToScreen(appState.currentScreenKey, appState.currentScreenArgs)
	} else {
		SwitchToScreen("home")
	}
}