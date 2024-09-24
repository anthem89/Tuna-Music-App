import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import cookieParser from "cookie-parser"
import authenticateRoute, { authenticationMiddleware } from "../routes/authenticate.js"

import playSongRoute from "../routes/play-song.js"
import playTemporarySongRoute from "../routes/play-temporary-song.js"
import searchAutocompleteRoute from "../routes/search-autocomplete.js"
import searchRoute from "../routes/search.js"
import downloadSongRoute from "../routes/download-song.js"
import userLibraryRoute from "../routes/user-library.js"


// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const port = 5502

app.use(cookieParser())
// Middleware to parse the body of requests
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get("/login", (req, res) => { res.sendFile(path.join(__dirname, "../public", "login.html")) })
app.get("/assets/img/fish-192.png", (req, res) => { res.sendFile(path.join(__dirname, "../public", "assets", "img","fish-192.png")) })
app.get("/css/login.css", (req, res) => { res.sendFile(path.join(__dirname, "../public", "css", "login.css")) })
app.get("/js/login.js", (req, res) => { res.sendFile(path.join(__dirname, "../public", "js", "login.js")) })

app.use("/authenticate", authenticateRoute)

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
