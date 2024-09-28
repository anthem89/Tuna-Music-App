import express from "express"

const router = express.Router()

router.get("/", (req, res) => {
	try {
		res.clearCookie("currentUser")
		res.clearCookie("authToken")
		res.redirect("/")
	} catch (e) {
		return res.status(401).json({ error: "Error logging out" })
	}
})

export default router

