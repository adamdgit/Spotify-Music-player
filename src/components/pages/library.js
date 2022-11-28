import { useEffect, useContext, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { GlobalContext } from "../login";
import Loading from "../Loading";
import { sanitizeArtistNames } from "../utils/sanitizeArtistNames";
import { createPlaylist } from "../../api/createPlaylist"
import { getUserPlaylists } from "../../api/getUserPlaylists"
import { unfollowPlaylist } from "../../api/unfollowPlaylist"
import { getSavedAlbums } from "../../api/getSavedAlbums"
import { removeAlbum } from "../../api/removeAlbum"
import { playContext } from "../../api/playContext";

export default function Library() {

  // global context
  const { token } = useContext(GlobalContext)
  const { contextURI, setContextURI } = useContext(GlobalContext)
  const { setContextID } = useContext(GlobalContext)
  const { userID } = useContext(GlobalContext)
  const { setMessage } = useContext(GlobalContext)
  const { setSongs } = useContext(GlobalContext)
  const { setPlayerIsHidden } = useContext(GlobalContext)
  // users playlists results
  const [isLoading, setLoading] = useState(false)
  const [playlists, setPlaylists] = useState([])
  const [albums, setAlbums] = useState([])
  const navigate = useNavigate()

  const playNewContext = (context) => {
    if (context.uri === contextURI) return console.error('context already playing')
    setPlayerIsHidden(false) // show playlist info when playing new context
    playContext(token, context.uri)
      .then(result => {
        if (result === false) {
          // clear playlist songs to allow new songs to be populated
          setSongs([])
          // save selected playlist data to global context
          setContextURI(context.uri)
          setContextID(context.id)
        }
        else console.error(result)
      })
  }

  const createNewPlaylist = () => {
    createPlaylist(token, userID)
    .then(result => {
      if (result.errorMsg === false) navigate(`/spotify/editPlaylist/${result.playlistData.id}`)
      else console.error(result.errorMsg)
    })
  }

  const remove = (id, name) => {
    removeAlbum(token, id)
    .then(result => {
      // remove result when unfollowing album if no errors returned
      if (result === false) return setAlbums(albums.filter((a) => {
        if (a.album.id === id) return false
        return true
      }))
      else console.error(result)
    })
    setMessage({msg: `${name} removed`, needsUpdate: true})
  }

  const unfollow = (id, name) => {
    unfollowPlaylist(token, id)
    .then(result => {
      // remove result when unfollowing playlist if no errors returned
      if (result === false) return setPlaylists(playlists.filter((a) => {
        if (a.id === id) return false
        return true
      }))
      else console.error(result)
    })
    setMessage({msg: `${name} unFollowed`, needsUpdate: true})
  }

  const getLibraryData = () => {
    setLoading(true)
    getUserPlaylists(token)
    .then(result => {
      if (result.errorMsg === false)
        setPlaylists(result.playlists.sort((a, b) => {
          if(a.owner.id === userID && b.owner.id === userID) return 0
          if(a.owner.id === userID && b.owner.id !== userID) return -1
          return 1
        }))
      else console.error(result.errorMsg)
    })
    getSavedAlbums(token)
    .then(result => {
      setLoading(false)
      if (result.errorMsg === false) setAlbums(result.albums)
      else console.error(result.errorMsg)
    })
  }

  useEffect(() => {

    if (!userID) return
    getLibraryData()

  },[userID])

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
              <div key={i} className={result.owner.id === userID ? 'result-large user' : 'result-large'}>
                {
                  result.images.length === 0 ? 
                  <span style={{display: 'grid', placeItems: 'center'}}>
                    <svg role="img" fill="currentcolor" height="64" width="64" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 3h15v15.167a3.5 3.5 0 11-3.5-3.5H19V5H8v13.167a3.5 3.5 0 11-3.5-3.5H6V3zm0 13.667H4.5a1.5 1.5 0 101.5 1.5v-1.5zm13 0h-1.5a1.5 1.5 0 101.5 1.5v-1.5z"></path></svg>
                  </span>
                  : 
                  <img src={
                    result.images.length === 0 ?
                    'no image found' :
                    result.images.length > 1 ?
                    result.images[1].url :
                    result.images[0].url
                    } alt={
                      result.images.length === 0 ?
                    'no image found' :
                    `${result.name} playlist art`
                    }
                    onClick={() => playNewContext(result)}
                  />
                }
                <span className="result-info">
                  <h2>{result.name}</h2>
                  <p>{result.description}</p>
                  {
                  result.owner.id !== userID 
                  ? <button 
                      className="unfollow" 
                      onClick={() => unfollow(result.id, result.name)}>
                        UnFollow
                    </button>
                  : 
                  <span className="result-btns">
                    <NavLink to={`/spotify/editPlaylist/${result.id}`} className="edit-link">
                      Edit
                    </NavLink>
                    <button 
                      className="unfollow" 
                      onClick={() => unfollow(result.id, result.name)}>
                        Delete
                    </button>
                  </span>
                  }
                </span>
              </div>
            )
          })
          : playlists?.length === 0 ? <h1>No playlists found</h1> : <></> 
        }
        {isLoading === true ? <Loading loadingMsg={'Fetching library items...'}/> : <></>}
        </div>

        <h1>Saved Albums:</h1>
        <div className="user-playlists-wrap">
        {
          albums? albums.map((result, i) => {
            if (result === null || result === undefined) return <></>
            return (
              <div key={i} className={'result-large'}>
                <img src={
                    result.album.images.length === 0 ?
                    'no image found' :
                    result.album.images.length > 1 ?
                    result.album.images[1].url :
                    result.album.images[0].url
                    } alt={
                      result.album.images.length === 0 ?
                    'no image found' :
                    `${result.name} playlist art`
                    }
                  onClick={() => playNewContext(result.album)}
                />
                <span className="result-info">
                  <h2>{result.album.name}</h2>
                  <p>{sanitizeArtistNames(result.album.artists)}</p>
                  <button 
                    className="remove" 
                    onClick={() => remove(result.album.id, result.album.name)}>
                    Remove
                  </button>
                </span>
              </div>
            )
          })
          : albums?.length === 0 ? <h1>No data found</h1> : <></>
        }
        </div>

      </div>
    </div>
  )
}