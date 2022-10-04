import { useContext } from "react"
import { GlobalContext } from "./login"
import { sanitizeArtistNames } from "./utils/sanitizeArtistNames"
import { showHideAddToPlaylistBtn } from "./utils/showHideAddToPlaylistBtn"
import { playTrack } from "./api/playTrack"
import { addTrackToPlaylist } from "./api/addTrackToPlaylist"
import { followPlaylist } from "./api/followPlaylist"
import { saveAlbum } from "./api/saveAlbum"

export default function SearchResult({...props}) {

  // global context
  const { token } = useContext(GlobalContext)
  const { setSongs } = useContext(GlobalContext)
  const { setContextURI } = useContext(GlobalContext)
  const { contextID, setContextID} = useContext(GlobalContext)
  const { setMessage } = useContext(GlobalContext)

  const addToPlaylist = async (resultURI, playlistid, playlistName) => {
    addTrackToPlaylist(resultURI, playlistid, token)
    .then(result => {
      if(result.length > 0) {
        // Only update currently playing song data if
        // playlist IDs match, as we need to sync the newly
        // added song to the current playlist
        if (contextID === playlistid) {
          return setSongs(result)
        }
        return
      }
      console.error(result)
    })
    setMessage(`Song added to playlist: ${playlistName}`)
    document.querySelector('.show-p').classList.remove('show-p')
  }

  const playSong = async (song)  => {
    playTrack(token, song)
    .then(result => {
      if (!result) return
      console.error(result)
    })
    // save new URIS data to global context (playlist or track)
    setContextURI(song.uri)
    // remove playlist ID as track is playing not playlist
    setContextID('')
  }

  const follow = async (id, name) => {
    followPlaylist(token, id)
    .then(result => {
      console.log(result)
    })
    setMessage(`${name} Followed`)
  }

  const album = async (id, name) => {
    saveAlbum(token, id)
    .then(result => {
      console.log(result)
    })
    setMessage(`${name} Saved`)
  }

  return (
    <>
    {
      props.array.length !== 0 ? <h2>{props.heading}</h2> : <></>
    }
    <div className={props.array.length === 0 ? 'search-results-wrap' : 'search-results-wrap show-search'}>
    { 
      props.heading === 'Tracks' ? // tracks
      props.array.map((result, i) => {
        if (result === null || result === undefined) return null
        return (
        <div key={i} className="result-small">
          <img src={
            result.album.images.length === 0 ?
            'no image found' :
            result.album.images.length === 3 ?
            result.album.images[2].url :
            result.album.images[0].url
            } alt={
              result.album.images.length === 0 ?
            'no image found' :
            `${result.name} album art`
            } width="64px" height="64px" />
          <span>
          <h3>{result.name}</h3>
          <p>{sanitizeArtistNames(result.artists)}</p>
          </span>
          <button className="add-to-playlist" onClick={(e) => showHideAddToPlaylistBtn(e.target)}>
            <svg style={{pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg" fill="currentcolor" width="20px" viewBox="0 0 512 512">{/* Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. */}<path d="M0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84.02L256 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 .0003 232.4 .0003 190.9L0 190.9z"/></svg>
            <span className={"choose-playlist"}>
              <h3>Add to playlist:</h3>
              <ul>
                {
                  props.playlists? props.playlists.map((playlist, index) => {
                    return <li key={index} style={{listStyle:"none"}} onClick={() => addToPlaylist(result.uri, playlist.id, playlist.name)}>{playlist.name}</li>
                  })
                  : <li>No playlists found</li>
                }
              </ul>
            </span>
          </button>
          <button className="play" onClick={() => playSong(result)}>
            <svg viewBox="0 0 16 16" height="25" width="25" fill="currentcolor"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>
          </button>
        </div>
        )
      })
      : props.heading === 'Albums' ? // albums
      props.array.map((result, i) => {
        if (result === null || result === undefined) return null
        return (
        <div key={i} className="result-small">
          <img src={
            result.images.length === 0 ?
            'no image found' :
            result.images.length === 3 ?
            result.images[2].url :
            result.images[0].url
            } alt={
              result.images.length === 0 ?
            'no image found' :
            `${result.name} album art`
            } width="64px" height="64px" />
          <span>
          <h3>{result.name}</h3>
          <p>{sanitizeArtistNames(result.artists)}</p>
          </span>
          <button className="play" onClick={() => album(result.id, result.name)}>
            Save
          </button>
          <button className="play">
            <svg viewBox="0 0 16 16" height="25" width="25" fill="currentcolor"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>
          </button>
        </div>
        )
      })
      : props.heading === 'Playlists' ? // playlists
      props.array.map((result, i) => {
        if (result === null || result === undefined) return null
        return (
          <div key={i} className="result-small">
          <img src={
            result.images.length === 0 ?
            'no image found' :
            result.images.length === 3 ?
            result.images[2].url :
            result.images[0].url
            } alt={
              result.images.length === 0 ?
            'no image found' :
            `${result.name} album art`
            } width="64px" height="64px" />
          <span>
          <h3>{result.name}</h3>
          <p>{result.owner.display_name}</p>
          </span>
          <button className="play" onClick={() => follow(result.id, result.name)}>
            Follow
          </button>
          <button className="play">
            <svg viewBox="0 0 16 16" height="25" width="25" fill="currentcolor"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>
          </button>
        </div>
        )
      })
      : <h3>No results</h3>
    }
    </div>
    </>
  )
}