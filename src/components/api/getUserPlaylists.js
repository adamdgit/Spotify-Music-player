import { useEffect, useContext, useState } from "react"
import axios from "axios"
import { LoginStatusCtx } from "../login";
import { changePlaylistSong } from "./changePlaylistSong";
import { NavLink } from "react-router-dom"

export default function GetUserPlaylists() {

  // global context
  const { token } = useContext(LoginStatusCtx)
  const { playerURIS, setPlayerURIS } = useContext(LoginStatusCtx)
  const { playlistID, setPlaylistID } = useContext(LoginStatusCtx)

  const [playlists, setPlaylists] = useState([])
  
  function playPlaylist(playlist){
    // save currently playing playlist data to global context
    setPlayerURIS(playlist.uri)
    setPlaylistID(playlist.id)
    changePlaylistSong(0, token, playlist.uri)
  }

  useEffect(() => {

    const getPlaylists = async () => {
        await axios.get('https://api.spotify.com/v1/me/playlists', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }).then((res) => {
          setPlaylists(res.data.items)
        }).catch(error => console.error(error))
    }
    getPlaylists()

  },[token])

  return (
      <>
        {
        playlists.length !== 0 ?
        playlists.map((result, i) => {
          return (
            <div key={i} className={'my-playlists-result'}>
              <img src={result.images.length !== 0 ? result.images[0].url : ''} alt={result.name + 'playlist art'} width={'200px'} height={'200px'} />
              <h2>{result.name}</h2>
              <p>{result.description}</p>
              <NavLink to={`/editPlaylist/${result.id}`}>
                <button className="play edit">Edit</button>
              </NavLink>
              <button className="play" onClick={() => playPlaylist(result)}>
                <svg viewBox="0 0 16 16" height="25" width="25" fill="currentcolor"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>
              </button>
            </div>
          )
        })
        : <h1>No playlists found</h1>
      }
    </>
  )
}