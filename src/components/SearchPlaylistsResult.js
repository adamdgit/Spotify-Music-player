import { useContext } from "react"
import { GlobalContext } from "./login"
import { playTrack } from "../api/playTrack"
import { playContext } from "../api/playContext"
import { followPlaylist } from "../api/followPlaylist"

export default function SearchPlaylistsResult({...props}) {

  // global context
  const { token } = useContext(GlobalContext)
  const { setSongs } = useContext(GlobalContext)
  const { setContextURI } = useContext(GlobalContext)
  const { setContextID} = useContext(GlobalContext)
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

  const follow = async (id, name) => {
    followPlaylist(token, id)
      .then(result => {
        if (!result) return
        console.error(result)
      })
    setMessage({msg: `${name} Followed`, needsUpdate: true})
  }

  return (
    <div style={props.searchPlaylists === false ? {display: 'none'} : {}}>
      <h2 style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
      <svg xmlns="http://www.w3.org/2000/svg" width="30px" fill="currentColor" viewBox="0 0 576 512"><path d="M0 96C0 60.7 28.7 32 64 32H512c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM128 288c17.7 0 32-14.3 32-32s-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32zm32-128c0-17.7-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32s32-14.3 32-32zM128 384c17.7 0 32-14.3 32-32s-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32zm96-248c-13.3 0-24 10.7-24 24s10.7 24 24 24H448c13.3 0 24-10.7 24-24s-10.7-24-24-24H224zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24H448c13.3 0 24-10.7 24-24s-10.7-24-24-24H224zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24H448c13.3 0 24-10.7 24-24s-10.7-24-24-24H224z"/></svg>
        Playlists
      </h2>

      <div className={props.searchPlaylists === false ? 'search-results-wrap' : 'search-results-wrap show-search'}>
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
      }
      </div>
    </div>
  )
}