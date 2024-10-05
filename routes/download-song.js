import express from "express"
import path from "path"
import { v4 as uuidv4 } from "uuid"

import ytdl from "@distube/ytdl-core"
import { createWriteStream, stat } from "fs"
import Ffmpeg from "fluent-ffmpeg"
import ffmpegPath from "ffmpeg-static"
import { SaveSongToLibrary, DeleteSongFromLibrary } from "./user-library.js"
import { TrackData } from "../public/js/components/data-models.js"

const router = express.Router()

router.post("/", async (req, res) => {
	try {
		Ffmpeg.setFfmpegPath(ffmpegPath)
		/** @type {TrackData} */
		const trackData = req.body.trackData
		let quality = req.body.quality === "high" ? "highestaudio" : "lowestaudio"
		const videoId = trackData?.video_id
		if (videoId == null) { throw new Error("You must provide a video id") }
		const videoUrl = "https://music.youtube.com/watch?v=" + videoId

		const uuid = uuidv4()
		const fileFormat = ".mp3"
		const outputPath = path.join("music-library", uuid + fileFormat)

		// Download the audio from the video
		const fileStream = createWriteStream(outputPath)

		ytdl(videoUrl, { filter: "audioonly", quality: quality })
			.pipe(fileStream)
			.on('finish', () => {
				// Once the download is finished, get the file size
				stat(outputPath, async (statsError, stats) => {
					try {
						// Once the file size is obtained, save the trackData to the database
						trackData.id = uuid
						trackData.file_format = fileFormat
						trackData.file_size = statsError ? 0 : stats.size
						trackData.date_downloaded = new Date().toISOString().slice(0, 19).replace("T", " ")
						trackData.user_id = req.user?.id

						await SaveSongToLibrary(trackData)

						res.send({ libraryUuid: uuid })
					} catch (e) {
						res.status(404).send({ error: e.toString() })
						DeleteSongFromLibrary([uuid], req.user?.id)
					}
				})
			})
			.on('error', (e) => {
				res.status(404).send({ error: e.toString() })
				DeleteSongFromLibrary([uuid], req.user?.id)
			})

	} catch (e) {
		res.status(404).send({ error: e.toString() })
		DeleteSongFromLibrary([uuid], req.user?.id)
	}
})

export default router
