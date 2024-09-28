import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import * as Database from "../server/database.js"

export const JWT_SECRET = "6dd69891-1303-4462-aab3-5dcc014f23c0"

// Middleware to authenticate and protect routes
export function authenticationMiddleware(req, res, next) {
	const token = req.cookies.authToken

	if (!token) {
		return res.status(401).redirect("/login")
	}

	// Verify token
	jwt.verify(token, JWT_SECRET, (err, user) => {
		if (err) {
			return res.status(401).redirect("/login")
		}
		req.user = user
		next()
	})
}

const router = express.Router()

router.post("/", async (req, res) => {
	try {
		const { username, password } = req.body

		if (!username || !password) {
			return res.status(400).json({ error: "Username and password are required" })
		}

		// Fetch the user from the database
		let user = await Database.readQuery("SELECT * FROM users WHERE username = ?", [username])
		user = user?.[0]
		if (user == null || user.length === 0) {
			return res.status(401).json({ error: "Username not found" })
		}

		// Check if the password is correct
		const isPasswordValid = bcrypt.compareSync(password, user.password)
		if (isPasswordValid === false) {
			return res.status(401).json({ error: "Invalid password" })
		}

		// Generate a token
		const authToken = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "90d" })

		const expiry = 90 * 24 * 60 * 60 * 1000 // 90 days in milliseconds
		res.cookie("currentUser", user.display_name, {
			maxAge: expiry
		})
		res.cookie("authToken", authToken, {
			httpOnly: true,
			secure: true,
			maxAge: expiry
		})

		// Redirect to the app home page
		res.redirect("/")

	} catch (e) {
		return res.status(401).json({ error: "Error logging in" })
	}
})

export default router

