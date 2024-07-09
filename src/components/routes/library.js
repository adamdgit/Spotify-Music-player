import { useEffect, useContext, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { GlobalContext } from "./login";
import SkeletonLoader from "../SkeletonLoader";
import { sanitizeArtistNames } from "../utils/sanitizeArtistNames";
import { createPlaylist } from "../../api/createPlaylist"
import { getUserPlaylists } from "../../api/getUserPlaylists"
import { unfollowPlaylist } from "../../api/unfollowPlaylist"
import { getSavedAlbums } from "../../api/getSavedAlbums"
import { removeAlbum } from "../../api/removeAlbum"
import { playContext } from "../../api/playContext";

export default function Library() {

  const { token } = useContext(GlobalContext)
  const { contextURI, setContextURI } = useContext(GlobalContext)
  const { setContextID } = useContext(GlobalContext)
  const { userID } = useContext(GlobalContext)
  const { setMessage } = useContext(GlobalContext)
  const { setSongs } = useContext(GlobalContext)
  const { setPlayerIsHidden } = useContext(GlobalContext)
  const { playlists, setPlaylists } = useContext(GlobalContext)

  const [isLoading, setLoading] = useState(false)
  const [albums, setAlbums] = useState([])
  const navigate = useNavigate()

  async function handlePlayNewContext(context) {
    // prevent restarting context if already playing / prevents new API call
    if (context.uri === contextURI) {
      return setMessage({ msg: `Context is already playing!`, needsUpdate: true });
    }
    // show playlist info when playing new context
    setPlayerIsHidden(false)
    // clear playlist songs to allow new songs to be populated
    setSongs([])
    const errorMsg = await playContext(token, context.uri);
    if (errorMsg) console.error(errorMsg)
    else {
      // save selected playlist data to global context
      setContextURI(context.uri)
      setContextID(context.id)
    }
  }

  async function createNewPlaylist() {
    const { errorMsg, playlistData } = await createPlaylist(token, userID);
    if (errorMsg) console.error(errorMsg)
    else navigate(`/spotify/editPlaylist/${playlistData.id}`)
  }

  async function handleRemove (id, name) {
    const errorMsg = await removeAlbum(token, id);
    if (errorMsg) console.error(errorMsg)
    else {
      setAlbums(albums.filter((a) => {
        if (a.album.id === id) return false
        return true
      }))
      setMessage({ msg: `${name} removed`, needsUpdate: true })
    }
  }

  async function handleUnfollow(id, name) {
    const errorMsg = await unfollowPlaylist(token, id);
    if (errorMsg) console.error(errorMsg)
    else {
      // filter playlists by user owned first
      setPlaylists(playlists.filter((playlist) => {
        return playlist.id !== id;
      }))
      setMessage({ msg: `${name} unFollowed`, needsUpdate: true })
    }
  }

  async function getPlaylists() {
    // start loading state to show skeleton loaders on mount
    setLoading(true)
    const { errorMsg, playlists} = await getUserPlaylists(token);
    if (errorMsg) console.error(errorMsg)
    else {
      console.log(playlists)
      setPlaylists(playlists.sort((a, b) => {
        if(a.owner.id === userID && b.owner.id === userID) return 0
        if(a.owner.id === userID && b.owner.id !== userID) return -1
        return 1
      }))
    }
  }

  async function getAlbums() {
    const { errorMsg, albums } = await getSavedAlbums(token);
    if (errorMsg) console.error(errorMsg)
    else {
      // finish loading state once playlists are fetched from server
      setLoading(false);
      setAlbums(albums);
    }
  }  

  useEffect(() => {
    if (!userID) return
    getPlaylists();
    getAlbums();
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
        {isLoading === true ? <SkeletonLoader type={'playlist'} /> : <></>}
        {
          playlists.length > 0 ? playlists.map((result, i) => {
            if (result === null || result === undefined) return null
            return (
              <div key={i} className={result.owner.id === userID ? 'result-large user' : 'result-large'}>
                {
                  !result.images ?
                  <span style={{display: 'grid', placeItems: 'center'}}>
                    <svg role="img" fill="currentcolor" height="64" width="64" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 3h15v15.167a3.5 3.5 0 11-3.5-3.5H19V5H8v13.167a3.5 3.5 0 11-3.5-3.5H6V3zm0 13.667H4.5a1.5 1.5 0 101.5 1.5v-1.5zm13 0h-1.5a1.5 1.5 0 101.5 1.5v-1.5z"></path></svg>
                  </span>
                  : 
                  <img src={
                    result.images.length > 1 ?
                    result.images[1].url :
                    result.images[0].url
                    } alt={
                      result.images.length === 0 ?
                    'no image found' :
                    `${result.name} playlist art`
                    }
                    onClick={() => handlePlayNewContext(result)}
                  />
                }
                <span className="result-info">
                  <h2>{result.name}</h2>
                  <p>{result.description}</p>
                  {
                  result.owner.id !== userID 
                  ? <button 
                      className="unfollow" 
                      onClick={() => handleUnfollow(result.id, result.name)}>
                        UnFollow
                    </button>
                  : 
                  <span className="result-btns">
                    <NavLink to={`/spotify/editPlaylist/${result.id}`} className="edit-link">
                      Edit
                    </NavLink>
                    <button 
                      className="unfollow" 
                      onClick={() => handleUnfollow(result.id, result.name)}>
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
                  onClick={() => handlePlayNewContext(result.album)}
                />
                <span className="result-info">
                  <h2>{result.album.name}</h2>
                  <p>{sanitizeArtistNames(result.album.artists)}</p>
                  <button 
                    className="remove" 
                    onClick={() => handleRemove(result.album.id, result.album.name)}>
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