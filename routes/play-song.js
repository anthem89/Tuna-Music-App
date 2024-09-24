import express from "express"
import path from "path"
import fs from "fs/promises"
import * as Database from "../server/database.js"

const router = express.Router()

router.get("/", async (req, res) => {
	try {
		const libraryUuid = req.query["library-uuid"]
		if (libraryUuid == null) { throw new Error("You must provide a valid library uuid") }

		const filePath = path.join("music-library", libraryUuid + ".mp3")
		await fs.access(filePath)
		res.download(filePath)

		const query = "UPDATE songs SET number_of_plays = number_of_plays + 1, date_last_played = CURRENT_TIMESTAMP WHERE id = ?"
		const params = [libraryUuid]
		Database.writeQuery(query, params)
	} catch (e) {
		res.status(404).send({ error: e.toString() })
	}
})

export default router