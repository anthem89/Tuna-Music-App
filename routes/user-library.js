import express from "express"
import * as Database from "../server/database.js"
import { TrackData } from "../public/js/components/track-data.js"
import { unlink, access } from "fs/promises"
import { constants } from "fs"
import path from "path"

/** @param {TrackData} trackData */
export function SaveSongToLibrary(trackData) {
	return new Promise(async (resolve, reject) => {
		try {
			if (trackData.id == null) { throw new Error("You must provide a valid library uuid") }
			if (trackData.user_id == null) { throw new Error("You must provide a valid user id") }

			const columns = Object.keys(trackData).join(", ")
			const placeholders = Object.keys(trackData).map(() => "?").join(", ")
			const values = Object.values(trackData)

			const query = `INSERT INTO songs (${columns}) VALUES (${placeholders})`

			await Database.writeQuery(query, values)

			resolve("success")
		} catch (e) {
			console.log("Error saving song to library - " + e.toString())
			reject(e)
		}
	})
}

/** 
 * @param {String[]} libraryUuidArray
 * @param {String} userId
 **/
export function DeleteSongFromLibrary(libraryUuidArray, userId) {
	return new Promise(async (resolve, reject) => {
		try {
			if (userId == null) { throw new Error("You must provide a valid user id") }
			if (Array.isArray(libraryUuidArray) === false || libraryUuidArray.length === 0) { throw new Error("You must provide a valid library uuid array") }
			libraryUuidArray = libraryUuidArray.filter((uuid) => uuid != null && uuid.trim() !== "")
			const placeholders = libraryUuidArray.map(() => "?").join(", ")
			// Remove the song from the database
			const query = "DELETE FROM songs WHERE user_id = ? AND id IN (" + placeholders + ")"
			const params = [userId, ...libraryUuidArray]
			const result = await Database.writeQuery(query, params)

			for (const libraryUuid of libraryUuidArray) {
				try {
					// Delete the song file from the file system
					let filePath = path.join("music-library", libraryUuid + ".mp3")
					// Check if the file exists
					await access(filePath, constants.F_OK)
					// Delete the file
					await unlink(filePath)
				} catch (e) {
					console.error("Error deleting song from filesystem - " + e.toString())
				}
			}
			resolve(result.changes)
		} catch (e) {
			reject(e)
		}
	})
}


const router = express.Router()

router.get("/", async (req, res) => {
	try {
		const userId = req.user?.id
		if (userId == null) { throw new Error("A valid user id is required") }

		// Get pagination parameters from query string
		const skip = parseInt(req.query.skip) || 0 // Default to 0 if not specified
		const top = parseInt(req.query.top) || 10 // Default to 10 if not specified

		// Adjust the query to use LIMIT and OFFSET
		const query = "SELECT * FROM songs WHERE user_id = ? LIMIT ? OFFSET ?"
		const params = [userId, top, skip]
		const data = await Database.readQuery(query, params)

		res.json(data)

	} catch (error) {
		res.status(404).send({ error: error.toString() }) // Fixed the error variable name
	}
})


router.delete("/delete-song", async (req, res) => {
	try {
		const idArray = req.body?.idArray
		const userId = req.user?.id
		let deletionCount = 0
		deletionCount = await DeleteSongFromLibrary(idArray, userId)
		res.send({
			status: "success",
			deletionCount: deletionCount
		})
	} catch (e) {
		res.status(404).send({ error: e.toString() })
	}
})

router.post("/edit-song-data", async (req, res) => {
	try {
		const libraryUuid = req.body?.libraryUuid
		const userId = req.user?.id


		res.send()
	} catch (e) {
		res.status(404).send({ error: e.toString() })
	}
})

export default router