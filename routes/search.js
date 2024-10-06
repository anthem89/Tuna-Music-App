import express from "express"
import { ytMusic } from "../server/globals.js"
import * as Database from "../server/database.js"

const router = express.Router()

router.get("/", async (req, res) => {
	try {
		const userId = req.user?.id
		if (userId == null) { throw new Error("A valid user id is required") }

		let searchResults = await ytMusic.searchSongs(req.query["query"])
		await TestIfVideoIdExistsInLibrary(searchResults, userId)
		res.send(searchResults)
	} catch (error) {
		res.status(404).send({ error: e.toString() })
	}
})

async function TestIfVideoIdExistsInLibrary(searchResults, userId) {
	return new Promise(async (resolve, reject) => {
		try {
			if (Array.isArray(searchResults) == false || searchResults.length === 0) {
				resolve()
				return
			}
			const videoIds = searchResults.map((searchResult) => searchResult.videoId)
			// Build the query to search the songs table for matching video id's
			let placeholders = ["?"]
			let params = [userId]
			videoIds.forEach(videoId => {
				if (videoId && videoId !== "") {
					placeholders.push("?")
					params.push(videoId)
				}
			})
			// If no matches are found, do nothing
			if (placeholders.length === 0) {
				resolve()
				return
			}
			const query = `
				SELECT video_id, id FROM songs
				WHERE user_id = ?
				AND video_id IN (${placeholders.join(", ")});
			`
			const dbResult = await Database.readQuery(query, params)
			if (Array.isArray(dbResult) && dbResult.length > 0) {
				let dbResultMap = dbResult.reduce((acc, item) => {
					acc[item.video_id] = item.id
					return acc
				}, {})
				searchResults.forEach((searchResult) => {
					searchResult.libraryUuid = dbResultMap[searchResult.videoId]
				})
			}
			resolve()
		} catch (e) {
			reject(e)
		}
	})
}

export default router