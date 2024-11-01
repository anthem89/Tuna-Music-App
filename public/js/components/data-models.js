export class TrackData {
	constructor({ id, title, artist, artist_id, album, album_id, release_date, genre, duration, number_of_plays, album_art, composer, date_downloaded, date_last_played, lyrics, file_format, file_size, quality, video_id, user_id }) {
		this.id = id
		this.title = title
		this.artist = artist
		this.artist_id = artist_id
		this.album = album
		this.album_id = album_id
		this.release_date = release_date
		this.genre = genre
		this.duration = duration
		this.number_of_plays = number_of_plays
		this.album_art = album_art
		this.composer = composer
		this.date_downloaded = date_downloaded
		this.date_last_played = date_last_played
		this.lyrics = lyrics
		this.file_format = file_format
		this.file_size = file_size
		this.quality = quality
		this.video_id = video_id
		this.user_id = user_id
	}
}

export class PlaylistData {
	constructor({ id, user_id, title, description, date_created, date_last_played, number_of_plays, playlist_image } = {}) {
		this.id = id
		this.user_id = user_id
		this.title = title
		this.description = description
		this.date_created = date_created
		this.date_last_played = date_last_played
		this.number_of_plays = number_of_plays || 0
		this.playlist_image = playlist_image
	}
}

export class ArtistData {
	constructor({ id, artist_name, artist_image }) {
		this.id = id
		this.artist_name = artist_name
		this.artist_image = artist_image
	}
}

export class AlbumData {
	constructor({ id, title, album_art, artist_id, artist, release_date, genre }) {
		this.id=  id
		this.title = title
		this.album_art = album_art
		this.artist_id = artist_id
		this.artist = artist
		this.release_date = release_date
		this.genre = genre
	}
}