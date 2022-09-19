import { sanitizeArtistNames } from "./utils/sanitizeArtistNames"

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
      <span className="draggable-trackname">
        <h1>{song.track.name}</h1>
        <p>{sanitizeArtistNames(song.track.artists)}</p>
      </span>
      <button className="remove-track-btn" title="remove track from playlist" onClick={() => func(song.track.uri)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="15px" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
      </button>
      <button className="drag-icon" title="hold to move track position">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM64 256c0-17.7 14.3-32 32-32H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H96c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"/>
        </svg>
      </button>
    </span>
  )

}