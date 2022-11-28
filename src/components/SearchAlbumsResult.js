import { useContext } from "react"
import { GlobalContext } from "./login"
import { sanitizeArtistNames } from "./utils/sanitizeArtistNames"
import { playTrack } from "../api/playTrack"
import { playContext } from "../api/playContext"
import { saveAlbum } from "../api/saveAlbum"

export default function SearchAlbumsResult({...props}) {

  // global context
  const { token } = useContext(GlobalContext)
  const { setSongs } = useContext(GlobalContext)
  const { setContextURI } = useContext(GlobalContext)
  const { setContextID } = useContext(GlobalContext)
  const { setMessage } = useContext(GlobalContext)


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

  const album = async (id, name) => {
    saveAlbum(token, id)
      .then(result => {
        if (!result) return
        console.error(result)
      })
    setMessage({msg: `${name} Saved`, needsUpdate: true})
  }

  return (
    <div style={props.searchAlbums === false ? {display: 'none'} : {}}>
      <h2 style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
        <svg xmlns="http://www.w3.org/2000/svg" width="30px" fill="currentColor" viewBox="0 0 512 512"><path d="M512 256c0 141.4-114.6 256-256 256S0 397.4 0 256S114.6 0 256 0S512 114.6 512 256zM256 352c-53 0-96-43-96-96s43-96 96-96s96 43 96 96s-43 96-96 96zm0 32c70.7 0 128-57.3 128-128s-57.3-128-128-128s-128 57.3-128 128s57.3 128 128 128zm0-96c17.7 0 32-14.3 32-32s-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32z"/></svg>
        Albums
      </h2>
      
      <div className='search-results-wrap'>
      { 
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
      }
      </div>
    </div>
  )
}