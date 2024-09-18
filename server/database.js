import sqlite3 from "sqlite3"

export let database

export function connectToDatabase() {
	return new Promise(async (resolve) => {
		try {
			if (database == null) {
				database = new sqlite3.Database("./music-database.db", () => {
					resolve(database)
				})
			} else {
				resolve(database)
			}
		} catch (e) {
			console.log("Error connecting to local database")
			resolve()
		}
	})
}

export const readQuery = (query) => {
	return new Promise((resolve, reject) => {
		connectToDatabase().then((db) => {
			db.all(query, (err, rows) => {
				if (err) {
					return reject(err)
				}
				resolve(rows)
			})
		}).catch(reject)
	})
}

export const writeQuery = (query, params) => {
	return new Promise((resolve, reject) => {
		connectToDatabase().then((db) => {
			db.run(query, params, function (err) { 
				if (err) {
					return reject(err)
				}
				resolve({ lastID: this.lastID, changes: this.changes }) 
			})
		}).catch(reject)
	})
}