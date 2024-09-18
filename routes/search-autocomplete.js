import express from "express"
import { ytMusic } from "../server/globals.js"
import fetch from "node-fetch"

const router = express.Router()

router.get("/", async (req, res) => {
	try {
		const requestOptions = {
			method: "GET",
			redirect: "follow"
		}
		const query = req.query["query"]
		const response = await fetch("https://suggestqueries-clients6.youtube.com/complete/search?client=youtube&hl=en&gl=us&gs_rn=64&gs_ri=youtube&ds=yt&cp=7&gs_id=5o&q=" + query + "&gs_gbg=Y0rD7OY3W5", requestOptions)
		let resText = await response.text()
		const startIndex = String("window.google.ac.h(").length
		resText = resText.substring(startIndex)
		resText = resText.substring(0, resText.length - 1)
		const parsedResults = JSON.parse(resText)
		if (parsedResults && parsedResults.length >= 2) {
			res.send(parsedResults[1].map((result) => result[0]))
		} else {
			res.send([])
		}
	} catch (error) {
		res.status(404).send(error.toString())
	}
})

export default router