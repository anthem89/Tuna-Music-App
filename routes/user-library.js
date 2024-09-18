import express from "express"
import { ytMusic } from "../server/globals.js"
import { TrackData } from "../public/js/components/track-data.js"
import { database, writeQuery, readQuery } from "../server/database.js"


const router = express.Router()

router.get("/", async (req, res) => {
	try {

		const query = "SELECT * FROM songs"
		const data = await readQuery(query)
		res.json(data)

	} catch (error) {
		res.status(404).send(error.toString())
	}
})

router.post("/save-song", async (req, res) => {
	try {
		const trackData = new TrackData(req.body)
		const status = await saveSongToLibrary(trackData)
		if(status === false){ throw new Error()}
		if(status !== "success"){
			throw new Error(status)
		}
		res.send(status)
	} catch (e) {
		res.status(404).send(e.toString())
	}
})

router.post("/delete-song", async (req, res) => {
	try {

		res.send()
	} catch (e) {
		res.status(404).send(e.toString())
	}
})

router.post("/edit-song-data", async (req, res) => {
	try {

		res.send()
	} catch (e) {
		res.status(404).send(e.toString())
	}
})

/** @param {TrackData} trackData */
export function saveSongToLibrary(trackData) {
	return new Promise(async (resolve) => {
		try {

			const columns = Object.keys(trackData).join(", ")
			const placeholders = Object.keys(trackData).map(() => "?").join(", ")
			const values = Object.values(trackData)

			const query = `INSERT INTO songs (${columns}) VALUES (${placeholders})`

			await writeQuery(query, values)

			resolve("success")
		} catch (e) {
			console.log("Error saving song to library - " + e.toString())
			resolve(e.toString())
		}
	})
}

export default router