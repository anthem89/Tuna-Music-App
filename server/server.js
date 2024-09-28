import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import cookieParser from "cookie-parser"
import authenticateRoute, { authenticationMiddleware } from "../routes/authenticate.js"
import compression from "compression"
import helmet from "helmet"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config()



import logoutRoute from "../routes/logout.js"
import playSongRoute from "../routes/play-song.js"
import playTemporarySongRoute from "../routes/play-temporary-song.js"
import searchAutocompleteRoute from "../routes/search-autocomplete.js"
import searchRoute from "../routes/search.js"
import downloadSongRoute from "../routes/download-song.js"
import userLibraryRoute from "../routes/user-library.js"


// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const port = process.env.PORT

// Use compression middleware
app.use(compression({
	level: 6, // Set the compression level (0-9)
	threshold: 1024, // Only compress responses larger than 1KB
}))

// Only allow secure connections in production environments
if (process.env.NODE_ENV !== "development") {
	// Enable secure HTTP headers with helmet
	app.use(helmet())
	// Redirect HTTP requests to HTTPS
	app.use((req, res, next) => {
		if (req.header("x-forwarded-proto") !== "https") {
			res.redirect("https://" + req.header("host") + req.url)
		} else {
			next()
		}
	})

	// Content Security Policy
	app.use(helmet({
		contentSecurityPolicy: {
			useDefaults: true,
			directives: {
				"default-src": ["'self'"], // Restricts all content by default to the same origin
				"script-src": ["'self'", "https://cdnjs.cloudflare.com/ajax/libs/"],  // Only allow inline or self-hosted scripts
				"style-src": ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'", "https://cdnjs.cloudflare.com/ajax/libs/"],
				"font-src": ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
				"connect-src": ["'self'"], // Controls AJAX, WebSocket, etc.
				"img-src": ["*"], // Allows images from same origin and inline base64 images
				"object-src": ["'none'"], // Blocks object, embed, and applet elements
				"media-src": ["'self'", "blob:"], // Allow media from blob URLs
				"manifestSrc": ["'self'"], // Ensure the manifest can be fetched
				"workerSrc": ["'self'"], // Allow service workers
			},
		},
	}))
}

// Use cors middleware to allow cross-origin requests to the specified origins
app.use(cors({
	origin: ["https://*.ngrok-free.app"],
	// credentials: true,
}))

app.use(cookieParser())
// Middleware to parse the body of requests
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get("/login", (req, res) => { res.sendFile(path.join(__dirname, "../public", "login.html")) })
app.get("/assets/img/fish-512.png", (req, res) => { res.sendFile(path.join(__dirname, "../public", "assets", "img", "fish-512.png")) })
app.get("/css/login.css", (req, res) => { res.sendFile(path.join(__dirname, "../public", "css", "login.css")) })
app.get("/js/login.js", (req, res) => { res.sendFile(path.join(__dirname, "../public", "js", "login.js")) })

app.use("/manifest.json", (req, res) => {res.sendFile(path.join(__dirname, "../public", "manifest.json")) })
app.use("/authenticate", authenticateRoute)
app.use("/logout", logoutRoute)

// Apply authentication middleware to all routes after this line
app.use(authenticationMiddleware)

// Serve static files from the "app" folder & require authentication to serve any of the files
app.use(express.static(path.join(__dirname, "../public")))

app.use("/play-song", playSongRoute)
app.use("/play-temporary-song", playTemporarySongRoute)
app.use("/search-autocomplete", searchAutocompleteRoute)
app.use("/search", searchRoute)
app.use("/download-song", downloadSongRoute)
app.use("/user-library", userLibraryRoute)

// Start the server
app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`)
})
