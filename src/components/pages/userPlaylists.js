import { useEffect, useContext, useState } from "react"
import { GlobalContext } from "../login";
import { NavLink, useNavigate } from "react-router-dom"
import { createPlaylist } from "../api/createPlaylist"
import { changePlaylistSong } from "../api/changePlaylistSong";
import { getUserPlaylists } from "../api/getUserPlaylists"

export default function UserPlaylists({...props}) {

  // global context
  const { token } = useContext(GlobalContext)
  const { setContextURI } = useContext(GlobalContext)
  const { setPlaylistID } = useContext(GlobalContext)
  const { userID } = useContext(GlobalContext)
  const { setPlayerCBData } = useContext(GlobalContext)

  const [playlists, setPlaylists] = useState([])
  const navigate = useNavigate()
  
  const playPlaylist = (playlist) => {
    // save currently playing playlist data to global context
    setContextURI(playlist.uri)
    setPlaylistID(playlist.id)
    changePlaylistSong(0, token, playlist.uri)
    setPlayerCBData(current => ({...current, type: 'track_update'}))
  }

  const createNewPlaylist = () => {
    // TODO: create playlist -> get playlist iD ->
    // -> redirect to edit page
    createPlaylist(props.token, props.userID)
    .then(result => {
      if (result.id) navigate(`/editPlaylist/${result.id}`)
      else console.error(result)
    })
  }

  useEffect(() => {
    getUserPlaylists(token)
    .then(result => {
      if (result.length === 0) return setPlaylists([])
      if (result.length > 0) return setPlaylists(result)
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
            playlists.length !== 0 ?
            playlists.map((result, i) => {
              if (result === null) return
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
                    <svg viewBox="0 0 16 16" height="25" width="25" fill="currentcolor"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>
                  </button>
                </div>
              )
            })
            : <h1>No playlists found</h1>
            }
          </>
        </div>
      </div>
    </div>
  )
}