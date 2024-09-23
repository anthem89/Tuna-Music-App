import express from "express"
import { ytMusic } from "../server/globals.js"

const router = express.Router()

router.get("/", async (req, res) => {
	try {
		const searchResults = await ytMusic.searchSongs(req.query["query"])
		res.send(searchResults)
	} catch (error) {
		res.status(404).send({ error: e.toString() })
	}
})

export default router