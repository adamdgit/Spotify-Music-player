import { useContext } from "react"
import { GlobalContext } from "./login"
import { sanitizeArtistNames } from "./utils/sanitizeArtistNames"
import { playTrack } from "../api/playTrack"
import { playContext } from "../api/playContext"
import { addTrackToPlaylist } from "../api/addTrackToPlaylist"
import AddToPlaylistBtn from "./AddToPlaylistBtn"

export default function SearchTracksResult({...props}) {

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

  return (
    <div style={props.searchTracks === false ? {display: 'none'} : {}}>
      <h2 style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
      <svg xmlns="http://www.w3.org/2000/svg" width="30px" fill="currentColor" viewBox="0 0 512 512"><path d="M499.1 6.3c8.1 6 12.9 15.6 12.9 25.7v72V368c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6V147L192 223.8V432c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6V200 128c0-14.1 9.3-26.6 22.8-30.7l320-96c9.7-2.9 20.2-1.1 28.3 5z"/></svg>
        Tracks
      </h2>

      <div className={props.searchTracks === false ? 'search-results-wrap' : 'search-results-wrap show-search'}>
      {
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
      }
      </div>
    </div>
  )
}