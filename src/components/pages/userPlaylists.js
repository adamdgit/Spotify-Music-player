import { useEffect, useContext, useState } from "react"
import { LoginStatusCtx } from "../login";
import { NavLink } from "react-router-dom"
import { createPlaylist } from "../api/createPlaylist"
import { changePlaylistSong } from "../api/changePlaylistSong";
import { getUserPlaylists } from "../api/getUserPlaylists"

export default function UserPlaylists({...props}) {

  // global context
  const { token } = useContext(LoginStatusCtx)
  const { setPlayerURIS } = useContext(LoginStatusCtx)
  const { setPlaylistID } = useContext(LoginStatusCtx)
  const { userID } = useContext(LoginStatusCtx)

  const [playlists, setPlaylists] = useState([])
  
  function playPlaylist(playlist){
    // save currently playing playlist data to global context
    setPlayerURIS(playlist.uri)
    setPlaylistID(playlist.id)
    changePlaylistSong(0, token, playlist.uri)
  }

  useEffect(() => {
    getUserPlaylists(token)
    .then(result => {
      if(result.length > 0) return setPlaylists(result)
      console.error(result)
    })
  },[token])

  return (
    <div className="page-wrap">
      <div className="main-content">
        <div className="create-playlists-wrap">
          <h1>My Playlists</h1>
          <button className="play" onClick={() => createPlaylist(props.token, props.userID)}>Create Playlist</button>
        </div>
        <>
          {
          playlists.length !== 0 ?
          playlists.map((result, i) => {
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
  )
}