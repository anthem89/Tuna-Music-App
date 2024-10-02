import express from "express"
import * as Database from "../server/database.js"
import { TrackData } from "../public/js/components/data-models.js"
import { unlink, access } from "fs/promises"
import { constants } from "fs"
import path from "path"

const router = express.Router()
export const allowedSongFilterFields = ["id", "title", "artist", "artist_id", "album", "album_id", "release_date", "genre", "number_of_plays", "composer", "date_downloaded", "date_last_played", "lyrics", "video_id"]

/** Fetch the user's library songs
 * Query Parameters:
 * skip, top, sortField, sortOrder, filterField, filterValue 
 */
router.get("/", async (req, res) => {
	try {
		const userId = req.user?.id
		if (userId == null) { throw new Error("A valid user id is required") }
		// Get pagination parameters from query string
		const skip = parseInt(req.query.skip) || 0 // Default to 0 if not specified
		const top = parseInt(req.query.top) || 10 // Default to 10 if not specified

		// Get sorting and filtering parameters
		const sortField = allowedSongFilterFields.includes(req.query.sort) ? req.query.sort : "date_downloaded"
		const sortOrder = req.query.order?.toLowerCase() === "asc" ? "ASC" : "DESC"
		const filterField = allowedSongFilterFields.includes(req.query.filterField) ? req.query.filterField : null
		const filterValue = req.query.filterValue

		// Base query
		let query = "SELECT * FROM songs WHERE user_id = ?"
		const params = [userId]

		// Add filtering if specified
		if (filterField && filterValue) {
			query += " AND " + filterField + " LIKE ?" // Use LIKE for partial matches
			params.push("%" + filterValue + "%")
		}

		// Add sorting
		query += " ORDER BY " + sortField + " " + sortOrder

		// Add pagination
		query += " LIMIT ? OFFSET ?"
		params.push(top, skip)

		const data = await Database.readQuery(query, params)

		res.json(data)
	} catch (error) {
		res.status(404).send({ error: error.toString() })
	}
})

router.delete("/delete-songs", async (req, res) => {
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

router.post("/edit-song-properties", async (req, res) => {
	try {
		const libraryUuid = req.body?.libraryUuid
		const userId = req.user?.id


		res.send()
	} catch (e) {
		res.status(404).send({ error: e.toString() })
	}
})

export default router


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