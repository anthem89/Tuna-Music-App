import express from "express"
import path from "path"
import { fileURLToPath } from "url"


import playSongRoute from "../routes/play-song.js"
import searchAutocompleteRoute from "../routes/search-autocomplete.js"
import searchRoute from "../routes/search.js"
import downloadSongRoute from "../routes/download-song.js"
import userLibraryRoute from "../routes/user-library.js"


// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const port = 5502

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "../public")))
// Middleware to parse the body of requests
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use("/play-song", playSongRoute)
app.use("/search-autocomplete", searchAutocompleteRoute)
app.use("/search", searchRoute)
app.use("/download-song", downloadSongRoute)
app.use("/user-library", userLibraryRoute)

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})
