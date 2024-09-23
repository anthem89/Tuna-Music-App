import express from "express"
import path from "path"
import fs from "fs/promises"

const router = express.Router()

router.get("/", async (req, res) => {
	try {
		const filePath = path.join("music-library", req.query["library-uuid"] + ".mp3")
		await fs.access(filePath)
		res.download(filePath)
	} catch (e) {
		res.status(404).send({ error: e.toString() })
	}
})

export default router