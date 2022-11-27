import { useContext } from "react"
import { GlobalContext } from "./login"
import { sanitizeArtistNames } from "./utils/sanitizeArtistNames"
import { playTrack } from "../api/playTrack"
import { playContext } from "../api/playContext"
import { addTrackToPlaylist } from "../api/addTrackToPlaylist"
import { followPlaylist } from "../api/followPlaylist"
import { saveAlbum } from "../api/saveAlbum"
import AddToPlaylistBtn from "./AddToPlaylistBtn"

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
      if(result.errorMsg === false) {
        if (contextID === playlistid) {
          return setSongs(result.tracks)
        }
        return
      }
      else console.error(result.errorMsg)
    })
    setMessage({msg: `Song added to playlist: ${playlistName}`, needsUpdate: true})
  }

  const playItem = async (uri, id)  => {

    // tracks have different endpoint
    if (id === 'track') {
      setSongs([])
      // remove contextID for tracks only
      setContextID('')
      // save new URIS data to global context (playlist or track)
      setContextURI(uri)
      playTrack(token, uri)
      .then(result => {
        if (!result) return
        console.error(result)
      })
    } else {
      setSongs([])
      setContextID(id)
      // save new URIS data to global context (playlist or track)
      setContextURI(uri)
      playContext(token, uri)
      .then(result => {
        if (!result) return
        console.error(result)
      })
    }

  }

  const follow = async (id, name) => {
    followPlaylist(token, id)
      .then(result => {
        if (!result) return
        console.error(result)
      })
    setMessage({msg: `${name} Followed`, needsUpdate: true})
  }

  const album = async (id, name) => {
    saveAlbum(token, id)
      .then(result => {
        if (!result) return
        console.error(result)
      })
    setMessage({msg: `${name} Saved`, needsUpdate: true})
  }

  return (
    <>
    {
      props.array.length !== 0 ? <h2 style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>{props.svg}{props.heading}</h2> : <></>
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
          <span className="info">
            <h3>{result.name}</h3>
            <p>{sanitizeArtistNames(result.artists)}</p>
          </span>
          <AddToPlaylistBtn 
            track={result}
            userPlaylists={props.playlists}
            addToPlaylist={addToPlaylist}
          />
          <button className="play" onClick={() => playItem(result.uri, 'track')}>
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
          <span className="info">
            <h3>{result.name}</h3>
            <p>{sanitizeArtistNames(result.artists)}</p>
          </span>
          <button className="play" onClick={() => album(result.id, result.name)}>
            Save
          </button>
          <button className="play" onClick={() => playItem(result.uri, result.id)}>
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
          <span className="info">
            <h3>{result.name}</h3>
            <p>{result.description}</p>
          </span>
          <button className="play" onClick={() => follow(result.id, result.name)}>
            Follow
          </button>
          <button className="play" onClick={() => playItem(result.uri, result.id)}>
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