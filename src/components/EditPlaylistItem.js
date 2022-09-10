import { convertTime } from "./func/convertTime"
import { sanitizeArtistNames } from "./func/sanitizeArtistNames"

export default function PlaylistItem({song, index, func, setDraggableElement}) {

  return (
    <span key={index} data-index={index} className="edit-draggable" ref={setDraggableElement}>
      <span>{index+1}</span>
      <img src={
        song.track.album.images.length === 0 ?
        'no image found' :
        song.track.album.images.length === 3 ?
        song.track.album.images[2].url :
        song.track.album.images[0].url
        } alt={
          song.track.album.images.length === 0 ?
        'no image found' :
        `${song.track.name} album art`
        } />
      <span className="play-song-tooltip">Play</span>
      <span className="draggable-trackname">
        <h1>{song.track.name}</h1>
        <p>{sanitizeArtistNames(song.track.artists)}</p>
      </span>
      <p className="song-length">{convertTime(song.track.duration_ms)}</p>
      <button className="remove-track-btn" title="remove track from playlist" onClick={() => func(song.track.uri)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentcolor" width="10px" viewBox="0 0 320 400">{/* Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. */}<path d="M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z"/></svg>
      </button>
      <button className="drag-icon" title="hold to move track position">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM64 256c0-17.7 14.3-32 32-32H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H96c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"/>
        </svg>
      </button>
    </span>
  )

}