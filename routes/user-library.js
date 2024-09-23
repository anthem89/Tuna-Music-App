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
			const columns = Object.keys(trackData).join(", ")
			const placeholders = Object.keys(trackData).map(() => "?").join(", ")
			const values = Object.values(trackData)

			const query = `INSERT INTO songs (${columns}) VALUES (${placeholders})`

			await Database.writeQuery(query, values)

			resolve("success")
		} catch (e) {
			console.log("Error saving song to library - " + e.toString())
			reject(e.toString())
		}
	})
}

/** @param {String} libraryUuid */
export function DeleteSongFromLibrary(libraryUuid) {
	return new Promise(async (resolve, reject) => {
		try {
			// Remove the song from the database
			const query = "DELETE FROM songs WHERE id = ?"
			const params = libraryUuid
			Database.writeQuery(query, params)

			// Delete the song file from the file system
			const filePath = path.join("music-library", libraryUuid + ".mp3")
			// Check if the file exists
			await access(filePath, constants.F_OK)
			// Delete the file
			await unlink(filePath)
			resolve()
		} catch (e) {
			reject(e)
		}
	})
}


const router = express.Router()

router.get("/", async (req, res) => {
	try {

		const query = "SELECT * FROM songs"
		const data = await Database.readQuery(query)
		res.json(data)

	} catch (error) {
		res.status(404).send({ error: e.toString() })
	}
})

router.delete("/delete-song", async (req, res) => {
	try {
		const libraryUuid = req.body?.libraryUuid
		if (libraryUuid == null) { throw new Error("You must provide a library uuid") }
		await DeleteSongFromLibrary(libraryUuid)
		res.send({
			status: "success",
			libraryUuid: libraryUuid
		})
	} catch (e) {
		res.status(404).send({ error: e.toString() })
	}
})

router.post("/edit-song-data", async (req, res) => {
	try {

		res.send()
	} catch (e) {
		res.status(404).send({ error: e.toString() })
	}
})

export default router