import express from "express"
import * as Database from "../server/database.js"
import { v4 as uuidv4 } from "uuid"
import { PlaylistData } from "../public/js/components/data-models.js"
import { allowedSongFilterFields } from "./user-library.js"

const router = express.Router()
export const allowedPlaylistFilterFields = ["id", "title", "description", "date_created", "date_last_played", "number_of_plays"]

/** Fetch the user's playlists
 * Query Parameters:
 * skip, top, sortField, sortOrder, filterField, filterValue 
 */
router.get("/", async (req, res) => {
	try {
		const userId = req.user?.id
		if (userId == null) { throw new Error("A valid user id is required") }
		// Get pagination parameters from query string
		const skip = parseInt(req.query.skip || -1)
		const top = parseInt(req.query.top || -1)
		// Get sorting and filtering parameters
		const sortField = allowedPlaylistFilterFields.includes(req.query.sortField) ? req.query.sortField : "date_created"
		const sortOrder = req.query.sortOrder?.toLowerCase() === "asc" ? "ASC" : "DESC"
		const filterField = allowedPlaylistFilterFields.includes(req.query.filterField) ? req.query.filterField : null
		const filterValue = req.query.filterValue
		// Base query
		let query = "SELECT * FROM playlists WHERE user_id = ?"
		const params = [userId]
		// Add filtering if specified
		if (filterField && filterValue) {
			query += " AND " + filterField + " LIKE ?" // Use LIKE for partial matches
			params.push("%" + filterValue + "%")
		}
		// Add sorting
		query += " ORDER BY " + sortField + " " + sortOrder
		// Add pagination
		if (top > 0) {
			query += " LIMIT ?"
			params.push(top)
		}
		if (skip > 0) {
			query += " OFFSET ?"
			params.push(skip)
		}

		const data = await Database.readQuery(query, params)
		res.json(data)
	} catch (error) {
		res.status(404).send({ error: error.toString() })
	}
})

router.get("/playlist-songs", async (req, res) => {
	try {
		const userId = req.user?.id
		const playlistId = req.query.playlistId

		if (userId == null) { throw new Error("A valid user id is required") }
		if (playlistId == null || playlistId === "") { throw new Error("A valid playlist id is required") }
		// Get pagination parameters from query string
		const skip = parseInt(req.query.skip || -1)
		const top = parseInt(req.query.top || -1)
		// Get sorting and filtering parameters
		const sortField = allowedSongFilterFields.includes(req.query.sortField) ? ("s." + req.query.sortField) : "ps.list_position"
		const sortOrder = req.query.sortOrder?.toLowerCase() === "asc" ? "ASC" : "DESC"
		const filterField = allowedSongFilterFields.includes(req.query.filterField) ? req.query.filterField : null
		const filterValue = req.query.filterValue
		// Base query to join playlist_songs and songs table
		let query = `
            SELECT s.*
            FROM playlist_songs ps
            JOIN songs s ON ps.song_id = s.id
            WHERE ps.playlist_id = ? AND ps.user_id = ?`

		const params = [playlistId, userId]
		// Add filtering if specified
		if (filterField && filterValue) {
			query += " AND " + filterField + " LIKE ?"
			params.push("%" + filterValue + "%")
		}
		// Add sorting
		query += " ORDER BY " + sortField + " " + sortOrder
		// Add pagination
		if (top > 0) {
			query += " LIMIT ?"
			params.push(top)
		}
		if (skip > 0) {
			query += " OFFSET ?"
			params.push(skip)
		}

		const data = await Database.readQuery(query, params)
		res.json(data)
	} catch (error) {
		res.status(404).send({ error: error.toString() })
	}
})


router.post("/create-playlist", async (req, res) => {
	try {
		const playlistId = uuidv4()
		const title = req.body?.title || "Untitled Playlist"
		const description = req.body?.description || ""
		const userId = req.user?.id
		if (userId == null) { throw new Error("A valid user id is required") }

		const query = "INSERT INTO playlists (id, user_id, title, description) VALUES (?, ?, ?, ?);"
		const params = [playlistId, userId, title, description]
		await Database.writeQuery(query, params)

		res.send({
			status: "success",
			playlistData: new PlaylistData({
				id: playlistId,
				user_id: userId,
				title: title,
				description: description,
				date_created: Date.now(),
				number_of_plays: 0,
				playlist_image: null,
				date_last_played: null
			})
		})
	} catch (e) {
		res.status(404).send({ error: e.toString() })
	}
})

router.post("/add-songs", async (req, res) => {
	try {
		const playlistId = req.body?.playlistId
		const songIds = req.body?.songIds // Expecting an array of song IDs
		const userId = req.user?.id

		if (userId == null) { throw new Error("A valid user id is required") }
		if (playlistId == null || playlistId === "") { throw new Error("A valid playlist id is required") }
		if (!Array.isArray(songIds) || songIds.length === 0) { throw new Error("A valid array of song ids is required") }

		// Build the query for bulk insertion
		let params = []
		let placeholders = []
		songIds.forEach(songId => {
			// Skip invalid or empty song IDs
			if (songId && songId !== "") {
				// Query will automatically add the list_position when adding the song to the db table by using a subquery to find the current max list position
				placeholders.push("(?, ?, ?, CURRENT_TIMESTAMP, (SELECT COALESCE(MAX(list_position), 0) + 1 FROM playlist_songs WHERE playlist_id = ?))")
				params.push(playlistId, songId, userId, playlistId) // add playlistId again for the subquery
			}
		})
		// If no valid songs were provided, do nothing
		if (params.length === 0) {
			return res.send({ status: "No valid song ids were provided" })
		}

		const query = `
            INSERT INTO playlist_songs (playlist_id, song_id, user_id, date_added, list_position)
            VALUES ${placeholders.join(", ")}
            ON CONFLICT(playlist_id, song_id) DO NOTHING;
        `
		const dbResult = await Database.writeQuery(query, params)

		res.send({
			status: `${dbResult.changes} songs added to playlist`,
			addedCount: dbResult.changes,
			playlistId: playlistId
		})
	} catch (e) {
		res.status(404).send({ error: e.toString() })
	}
})

router.post("/remove-songs", async (req, res) => {
    try {
        const playlistId = req.body?.playlistId
        const songIds = req.body?.songIds // Expecting an array of song IDs
        const userId = req.user?.id

        if (userId == null) { throw new Error("A valid user id is required") }
        if (playlistId == null || playlistId === "") { throw new Error("A valid playlist id is required") }
        if (!Array.isArray(songIds) || songIds.length === 0) { throw new Error("A valid array of song ids is required") }

        // Build the query for bulk deletion
        let placeholders = []
        let params = [playlistId, userId]
        songIds.forEach(songId => {
            // Skip invalid or empty song IDs
            if (songId && songId !== "") {
                placeholders.push("?")
                params.push(songId)
            }
        })
        // If no valid songs were provided, do nothing
        if (placeholders.length === 0) {
            return res.send({ status: "No valid song ids were provided" })
        }
        // Step 1: Delete the songs
        const deleteQuery = `
            DELETE FROM playlist_songs
            WHERE playlist_id = ? AND user_id = ?
            AND song_id IN (${placeholders.join(", ")});
        `
        const dbDeleteResult = await Database.writeQuery(deleteQuery, params)
        // Step 2: Recalculate the new list_positions for each song
        const updateQuery = `
            UPDATE playlist_songs
            SET list_position = (
                SELECT COUNT(*)
                FROM playlist_songs ps
                WHERE ps.playlist_id = playlist_songs.playlist_id
                AND ps.list_position <= playlist_songs.list_position
            )
            WHERE playlist_id = ?;
        `
        await Database.writeQuery(updateQuery, [playlistId])

        res.send({
            status: `${dbDeleteResult.changes} songs removed from playlist`,
            removedCount: dbDeleteResult.changes,
            playlistId: playlistId
        })
    } catch (e) {
        res.status(404).send({ error: e.toString() })
    }
})


router.delete("/delete-playlist", async (req, res) => {
	try {
		const playlistId = req.body?.playlistId
		const userId = req.user?.id

		if (userId == null) { throw new Error("A valid user id is required") }
		if (playlistId == null) { throw new Error("A valid playlist id is required") }

		const query = "DELETE FROM playlists WHERE id = ? AND user_id = ?;"
		const params = [playlistId, userId]
		await Database.writeQuery(query, params)

		res.send({
			status: "success",
			playlistId: playlistId
		})
	} catch (e) {
		res.status(404).send({ error: e.toString() })
	}
})

router.post("/edit-playlist-properties", async (req, res) => {
	try {
		/** @type {PlaylistData} */
		const playlistData = req.body?.playlistData
		const userId = req.user?.id
		if (userId == null) { throw new Error("A valid user id is required") }
		if (playlistData.id == null) { throw new Error("A valid playlist id is required") }

		let query = "UPDATE playlists SET"
		const params = []
		let updateFields = []

		let title = playlistData.title
		let description = playlistData.description
		let playlistImage = playlistData.playlist_image

		if (title != null) {
			updateFields.push("title = ?")
			params.push(title)
		}
		if (description != null) {
			updateFields.push("description = ?")
			params.push(description)
		}
		if (playlistImage != null) {
			updateFields.push("playlist_image = ?")
			params.push(playlistImage)
		}
		// If there are no fields to update, do nothing
		if (updateFields.length === 0) {
			return res.send({ status: "nothing to update" })
		}
		// Add conditions to the query
		query += ` ${updateFields.join(", ")} WHERE id = ? AND user_id = ?`
		params.push(playlistData.id, userId)

		await Database.writeQuery(query, params)

		res.send({
			status: "success",
			playlistId: playlistData.id
		})
	} catch (e) {
		res.status(404).send({ error: e.toString() })
	}
})


export default router