import { useEffect, useContext, useState } from "react"
import { GlobalContext } from "../login";
import { NavLink, useNavigate } from "react-router-dom"
import { createPlaylist } from "../api/createPlaylist"
import { changePlaylistSong } from "../api/changePlaylistSong";
import { getUserPlaylists } from "../api/getUserPlaylists"
import { getFeaturedPlaylists } from "../api/getFeaturedPlaylists"
import Loading from "../Loading";

export default function UserPlaylists({...props}) {

  // global context
  const { token } = useContext(GlobalContext)
  const { setContextURI } = useContext(GlobalContext)
  const { setPlaylistID } = useContext(GlobalContext)
  const { userID } = useContext(GlobalContext)
  // users playlists results
  const [playlists, setPlaylists] = useState()
  // featured results
  const [results, setResults] = useState([])
  const navigate = useNavigate()
  
  const playPlaylist = (playlist) => {
    // save currently playing playlist data to global context
    setContextURI(playlist.uri)
    setPlaylistID(playlist.id)
    changePlaylistSong(0, token, playlist.uri)
  }

  const createNewPlaylist = () => {
    createPlaylist(props.token, props.userID)
    .then(result => {
      if (result.id) navigate(`/editPlaylist/${result.id}`)
      else console.error(result)
    })
  }

  useEffect(() => {

    getUserPlaylists(token)
    .then(result => {
      console.log(result)
      if (result?.length === 0) return setPlaylists([])
      // sort by user owned first
      else if (result?.length > 0) return setPlaylists(result?.sort((a, b) => {
        if(a.owner.id === userID && b.owner.id === userID) return 0
        if(a.owner.id === userID && b.owner.id !== userID) return -1
        return 1
      }))
      else console.error(result) 
    })

    getFeaturedPlaylists(token)
    .then(result => {
      if (result?.length === 0) return setResults([])
      else if (result?.length > 0) return setResults(result)
      else console.error(result) 
    })

  },[token])

  return (
    <div className="page-wrap">
      <div className="main-content">
        <div className="user-playlists-header">
          <h1>My Playlists</h1>
          <button className="play" onClick={() => createNewPlaylist()}>
            Create Playlist
          </button>
        </div>
        <div className="user-playlists-wrap">
          <>
            {
            playlists? playlists.map((result, i) => {
              if (result === null || result === undefined) return
              return (
                <div key={i} className={'my-playlists-result'}>
                  <img src={result.images.length !== 0 ? result.images[0].url : ''} alt={result.name + 'playlist art'} width={'200px'} height={'200px'} />
                  <h2>{result.name}</h2>
                  <p>{result.description}</p>
                  {
                    result.owner.id !== userID 
                    ? <button></button>
                    : <NavLink to={`/editPlaylist/${result.id}`} className="edit-link">
                        <button className="play edit">Edit</button>
                      </NavLink>
                  }
                  <button className="play" onClick={() => playPlaylist(result)}>
                    <svg viewBox="0 0 16 16" height="20px" width="20px" fill="currentcolor"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>
                  </button>
                </div>
              )
            })
            : playlists?.length === 0 ? <h1>No data found</h1>
            : <Loading loadingMsg={'Fetching your playlists...'}/>
            }
          </>
        </div>

        <div className="explore-wrap">
        <h1 className="featured">Spotify featured playlists:</h1>
          {
            results? results.map((result, i) => {
              if (result === null || result === undefined) return
              return (
                <div key={i} className={'explore-result'}>
                  <img src={
                    result.images.length === 0 ?
                    'no image found' :
                    result.images[0].url
                    } alt={
                    result.images.length === 0 ?
                    'no image found' :
                    `${result.name} playlist art`
                    } width={'200px'} height={'200px'} />
                  <h2>{result.name}</h2>
                  <p>{result.description}</p>
                  <button className="play" onClick={() => playPlaylist(result)}>
                    <svg viewBox="0 0 16 16" height="20px" width="20px" fill="currentcolor"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>
                  </button>
                </div>
              )
            })
            : results?.length === 0 ? <h1>No data found</h1>
            : <Loading loadingMsg={'Fetching featured playlists...'}/>
          }
        </div>

      </div>
    </div>
  )
}