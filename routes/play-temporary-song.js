import express from "express"
import ytdl from "@distube/ytdl-core"

const router = express.Router()

router.get("/", async (req, res) => {
	try {
		const videoId = req.query.videoId
		const videoUrl = "https://music.youtube.com/watch?v=" + videoId

		// Set response headers for downloading
		res.setHeader("Content-Disposition", "attachment; filename=audio.webm")
		res.setHeader("Content-Type", "audio/webm")

		// Directly stream without conversion to mp3 using FFMPEG. this is significantly faster when the user doesn't need to save the file to disk
		const stream = ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio' })
		stream.pipe(res).on("error", (e) => {
			res.status(500).send({ error: e.toString() })
		})
	} catch (e) {
		res.status(404).send({ error: e.toString() })
	}
})

export default router