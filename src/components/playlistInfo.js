import axios from "axios";
import CurrentSong from "./CurrentSong";
import { useState, useEffect, useContext, useMemo } from "react";
import { GlobalContext } from "./login";
import { changePlaylistSong } from "../api/changePlaylistSong";
import { addTrackToPlaylist } from "../api/addTrackToPlaylist"
import { convertTime } from "./utils/convertTime"
import { sanitizeArtistNames } from "./utils/sanitizeArtistNames"
import { getUserPlaylists } from "../api/getUserPlaylists"
import Tooltip from "./Tooltip";
import AddToPlaylistBtn from "./AddToPlaylistBtn";

function PlaylistInfo() {

  // global context
  const { token } = useContext(GlobalContext)
  const { userID } = useContext(GlobalContext)
  const { contextURI } = useContext(GlobalContext)
  const { currentTrackID } = useContext(GlobalContext)
  const { contextID } = useContext(GlobalContext)
  const { songs, setSongs } = useContext(GlobalContext)
  const { playerIsHidden } = useContext(GlobalContext)
  // playlist update message
  const { setMessage } = useContext(GlobalContext)
  // component state
  const [playlistOwner, setPlaylistOwner] = useState('')
  const [playlistName, setPlaylistName] = useState('No playlist data')
  const [playlistDesc, setPlaylistDesc] = useState('')
  const [playlists, setPlaylists] = useState([]) // filtered to show user owned
  const [playlistArt, setPlaylistArt] = useState('')
  const [totalContextDuration, setContextDuration] = useState(0)

  const addToPlaylist = (resultURI, playlistid, playlistName) => {
    addTrackToPlaylist(resultURI, playlistid, token)
      .then(result => { 
        if (result.errorMsg === false) return
        else console.error(result.errorMsg)
      })
      setMessage({msg: `Song added to playlist: ${playlistName}`, needsUpdate: true})
  }

  // return only user owned playlists, for add-to-playlist button
  useEffect(() => {
    getUserPlaylists(token)
      .then(result => {
        if (result.errorMsg === false) return setPlaylists(result.playlists.filter(a => {
          if(a.owner.id === userID) return a
          return null
        }))
        else console.error(result.errorMsg)
      })
  },[userID])

  // when context changes check for playlist or album and get data
  useEffect(() => {
    // get playlist data
    if(contextURI?.includes('playlist')) {
      const getPlaylistData = async () => {
        await axios.get(`https://api.spotify.com/v1/playlists/${contextID}?limit=100`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }).then((result) => {
          if (result.data) {
            setPlaylistArt(result.data.images[0].url)
            setPlaylistDesc(result.data.description)
            setPlaylistName(result.data.name)
            setSongs(result.data.tracks.items)
            setPlaylistOwner(result.data.owner.id)
          } else { console.error(result) }
        })
      }
      getPlaylistData()
    }
    // get album data
    if (contextURI?.includes('album')) {
      const getAlbumData = async () => {
        await axios.get(`https://api.spotify.com/v1/albums/${contextID}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }).then((result) => {
          if (result.data) {
            setPlaylistArt(result.data.images[0].url)
            setPlaylistDesc(result.data.label)
            setPlaylistName(result.data.name)
            setSongs(result.data.tracks.items)
            setPlaylistOwner('n/a')
          } else { console.error(result) }
        })
      }
      getAlbumData()
    }
  }, [contextURI])

  useMemo(() => {
    setContextDuration(0)
    // get total playlist duration
    songs.forEach(song => {
      setContextDuration((current) => current += song.track.duration_ms)
    })
  }, [songs])

  return (
    <div style={!contextID ? {gridTemplateColumns:"unset"}:{}} className={playerIsHidden === true ? "playlist-wrap hide" : "playlist-wrap"}>
      
      <CurrentSong />

      <div className={!contextID ? "hidden" : "playlist"}>
        <div className="playlist-info-wrap">
          <img className="playlist-art" 
            src={playlistArt? playlistArt : 'no image found'} 
            alt={playlistArt? `${playlistName} playlist cover art` : 'no image found'} 
            />
          <span>
            <h1 style={{fontSize: '2.5rem'}}>{playlistName}</h1>
            <h2 style={{fontSize: '1rem', fontWeight: 'normal'}}>{playlistDesc}</h2>
            <h3 style={{display: 'flex', gap: '1rem'}}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20px" fill="#999"><path d="M232 120C232 106.7 242.7 96 256 96C269.3 96 280 106.7 280 120V243.2L365.3 300C376.3 307.4 379.3 322.3 371.1 333.3C364.6 344.3 349.7 347.3 338.7 339.1L242.7 275.1C236 271.5 232 264 232 255.1L232 120zM256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0zM48 256C48 370.9 141.1 464 256 464C370.9 464 464 370.9 464 256C464 141.1 370.9 48 256 48C141.1 48 48 141.1 48 256z"/></svg>
              {convertTime(totalContextDuration)}
            </h3>
          </span>
        </div>

        <div className="song-category">
          <h3>#</h3>
          <h3>Album</h3>
          <h3>Title</h3>
          <h3>Length</h3>
        </div>
        
        <div className="container">
          {
            contextURI?.includes('playlist') ? songs.map((song, index) => {
              if (song === null || song === undefined) return null
              return (
                <span key={index} data-index={index} onClick={() => changePlaylistSong(index, token, contextURI)}
                  style={playlistOwner === userID ? {gridTemplateColumns: '18px 80px auto 40px'} : {}} 
                  className={currentTrackID === song.track.id ? "draggable selected" : "draggable"}> 
                  <Tooltip tip={'Play'} />
                  <span>{index+1}</span>
                    <img src={
                      song.track.album.images.length === 0 ?
                      'no image found' :
                      song.track.album.images.length === 3 ?
                      song.track.album.images[2].url :
                      song.track.album.images[0].url}
                      alt={
                      song.track.album.images.length === 0 ?
                      'no image found' :
                      `${song.track.name} album art`}
                    />
                  <span className="draggable-trackname">
                    <h1>{song.track.name}</h1>
                    <p>{sanitizeArtistNames(song.track.artists)}</p>
                  </span>
                  <p className="song-length">{convertTime(song.track.duration_ms)}</p>
                  {
                    playlistOwner === userID ?
                    <></>
                    :
                    <AddToPlaylistBtn 
                      track={song.track}
                      userPlaylists={playlists}
                      addToPlaylist={addToPlaylist}
                    />
                  }
                </span>
              )
            }) : contextURI === "" ? <h1>No playlist available</h1> : <></>
          }

          {
            contextURI?.includes('album') ? songs.map((song, index) => {
              if (song === null || song === undefined) return null
              return (
                <span key={index} data-index={index} className={currentTrackID === song.id ? "draggable selected" : "draggable"}>
                  <span>{index+1}</span>
                  <button onClick={() => { changePlaylistSong(index, token, contextURI) }} className="play-song-btn">
                  <Tooltip tip={'Play'} />
                  <img 
                    src={playlistArt? playlistArt : 'no image found'} 
                    alt={playlistArt? `${playlistName} playlist cover art` : 'no image found'} 
                  />
                  </button>
                  <span className="draggable-trackname">
                    <h1>{song.name}</h1>
                    <p>{sanitizeArtistNames(song.artists)}</p>
                  </span>
                  <p className="song-length">{convertTime(song.duration_ms)}</p>
                  <AddToPlaylistBtn 
                    track={song}
                    userPlaylists={playlists}
                    addToPlaylist={addToPlaylist}
                  />
                </span>
              )
            }) : contextURI === "" ? <h1>No playlist available</h1> : <></>
          }
        </div>
      </div>
    </div>
  ) 
}

export default PlaylistInfo