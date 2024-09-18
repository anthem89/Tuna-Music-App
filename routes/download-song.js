import express from "express"
import path from "path"
import { v4 as uuidv4 } from 'uuid'
import { saveSongToLibrary } from "./user-library.js";

import ytdl from "@distube/ytdl-core";
import { createWriteStream, stat } from 'fs';
import Ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

const router = express.Router()

router.get("/", async (req, res) => {
	try {
		Ffmpeg.setFfmpegPath(ffmpegPath)
		const videoId = req.query.videoId
		const videoUrl = "https://music.youtube.com/watch?v=" + videoId

		const uuid = uuidv4()
		const fileFormat = ".mp4"
		const outputPath = path.join("./music-library/" + uuid + fileFormat)

		// Download the audio from the video
		const fileStream = createWriteStream(outputPath)

		ytdl(videoUrl, { filter: 'audioonly' })
			.pipe(fileStream)
			.on('finish', () => {
				// Once the download is finished, get the file size
				stat(outputPath, (statsError, stats) => {
					res.send({
						uuid: uuid,
						fileFormat: fileFormat,
						fileSize: statsError ? 0 : stats.size
					})
				})
			})
			.on('error', (e) => {
				res.status(404).send(e.toString())
			})

	} catch (e) {
		res.status(404).send(e.toString())
	}
})

export default router
