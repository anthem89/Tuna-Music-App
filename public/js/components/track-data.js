export class TrackData {
	constructor({ id, title, artist, artist_id, album, album_id, release_date, genre, duration, number_of_plays, album_art, composer, date_downloaded, date_last_played, lyrics, file_format, file_size, video_id }) {
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
		this.video_id = video_id
	}
}