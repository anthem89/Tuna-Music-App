import express from "express"
import path from "path"
import fs from "fs/promises"

const router = express.Router()

router.get("/", async (req, res) => {
	try {
		const filePath = path.join("./music-library", req.query["library-uuid"] + ".mp3")
		await fs.access(filePath)
		res.download(filePath)
	} catch (error) {
		res.status(404).send("File not found")
	}
})

export default router