import { useEffect, useContext, useState } from "react"
import { GlobalContext } from "../login";
import { NavLink, useNavigate } from "react-router-dom"
import { createPlaylist } from "../api/createPlaylist"
import { changePlaylistSong } from "../api/changePlaylistSong";
import { getUserPlaylists } from "../api/getUserPlaylists"
import { unfollowPlaylist } from "../api/unfollowPlaylist"
import { getSavedAlbums } from "../api/getSavedAlbums"
import Loading from "../Loading";
import { sanitizeArtistNames } from "../utils/sanitizeArtistNames";
import { removeAlbum } from "../api/removeAlbum"

export default function Library() {

  // global context
  const { token } = useContext(GlobalContext)
  const { setContextURI } = useContext(GlobalContext)
  const { setContextID } = useContext(GlobalContext)
  const { userID } = useContext(GlobalContext)
  const { setMessage } = useContext(GlobalContext)
  const { setSongs } = useContext(GlobalContext)
  // users playlists results
  const [playlists, setPlaylists] = useState([])
  const [albums, setAlbums] = useState([])
  const navigate = useNavigate()

  const playContext = (context) => {
    // clear playlist songs to allow new songs to be populated
    setSongs([])
    // save selected playlist data to global context
    setContextURI(context.uri)
    setContextID(context.id)
    changePlaylistSong(0, token, context.uri)
  }

  const createNewPlaylist = () => {
    createPlaylist(token, userID)
    .then(result => {
      if (result.id) navigate(`/editPlaylist/${result.id}`)
      else console.error(result)
    })
  }

  const remove = (id, name) => {
    removeAlbum(token, id)
    .then(result => {
      console.log(result)
    })
    setMessage(`${name} removed`)
  }

  const unfollow = (id, name) => {
    unfollowPlaylist(token, id)
    .then(result => {
      console.log(result)
    })
    setMessage(`${name} unFollowed`)
  }

  useEffect(() => {

    if (!userID) return
    getUserPlaylists(token)
    .then(result => {
      if (result?.length === 0) return setPlaylists([])
      // sort by user owned first
      if (result?.length > 0) return setPlaylists(result?.sort((a, b) => {
        if(a.owner.id === userID && b.owner.id === userID) return 0
        if(a.owner.id === userID && b.owner.id !== userID) return -1
        return 1
      }))
      else console.error(result) 
    })

    getSavedAlbums(token)
    .then(result => {
      if (result?.length === 0) return setAlbums([])
      // sort by user owned first
      if (result?.length > 0) return setAlbums(result)
      else console.error(result) 
    })

  },[token, userID])

  return (
    <div className="page-wrap">
      <div className="main-content">
        <div className="user-playlists-header">
          <h1>Your Playlists:</h1>
          <button className="play" onClick={() => createNewPlaylist()}>
            Create Playlist
          </button>
        </div>
        <div className="user-playlists-wrap">
          {
          playlists? playlists.map((result, i) => {
            if (result === null || result === undefined) return <></>
            return (
              <div key={i} className={'result-large'} 
              style={result.owner.id === userID ? {border: '1px solid white', boxShadow: 'inset 4px 4px 10px black'} : {} }>
                <img src={result.images.length !== 0 ? result.images[0].url : ''} alt={result.name + 'playlist art'} width={'200px'} height={'200px'} />
                <h2>{result.name}</h2>
                <p>{result.description}</p>
                {
                  result.owner.id !== userID 
                  ? <button 
                      className="play" 
                      onClick={() => unfollow(result.id, result.name)}
                      style={{width: '80px', justifySelf: 'flex-end'}}>
                        UnFollow
                    </button>
                  : <NavLink to={`/editPlaylist/${result.id}`} className="edit-link">
                      <button className="play">Edit</button>
                    </NavLink>
                }
                <button className="play" onClick={() => playContext(result)}>
                  <svg viewBox="0 0 16 16" height="20px" width="20px" fill="currentcolor"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>
                </button>
              </div>
            )
          })
          : playlists?.length === 0 ? <h1>No data found</h1>
          : <Loading loadingMsg={'Fetching your playlists...'}/>
          }
        </div>

        <h1>Saved Albums:</h1>
        <div className="user-playlists-wrap">
          {
          albums? albums.map((result, i) => {
            if (result === null || result === undefined) return <></>
            return (
              <div key={i} className={'result-large'}>
                <img src={result.album.images.length !== 0 ? result.album.images[0].url : ''} alt={result.name + 'playlist art'} width={'200px'} height={'200px'} />
                <h2>{result.album.name}</h2>
                <p>{sanitizeArtistNames(result.album.artists)}</p>
                <button 
                      className="play" 
                      onClick={() => remove(result.album.id, result.album.name)}
                      style={{width: '80px', justifySelf: 'flex-end'}}>
                        Remove
                    </button>
                <button className="play" onClick={() => playContext(result.album)}>
                  <svg viewBox="0 0 16 16" height="20px" width="20px" fill="currentcolor"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>
                </button>
              </div>
            )
          })
          : albums?.length === 0 ? <h1>No data found</h1>
          : <Loading loadingMsg={'Fetching your playlists...'}/>
          }
        </div>

      </div>
    </div>
  )
}