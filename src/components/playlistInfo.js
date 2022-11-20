import axios from "axios";
import CurrentSong from "./currentSong";
import { useState, useEffect, useRef, useContext } from "react";
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
  const { playerCBType } = useContext(GlobalContext)
  const { currentTrackID } = useContext(GlobalContext)
  const { contextID } = useContext(GlobalContext)
  const { songs, setSongs } = useContext(GlobalContext)
  const { playerIsHidden } = useContext(GlobalContext)
  // playlist update message
  const { setMessage } = useContext(GlobalContext)
  // component state
  const [currentItem, setCurrentItem] = useState()
  const [playlistOwner, setPlaylistOwner] = useState('')
  const [playlistName, setPlaylistName] = useState('No playlist data')
  const [playlistDesc, setPlaylistDesc] = useState('')
  const [playlists, setPlaylists] = useState([]) // filtered to show user owned
  const [playlistArt, setPlaylistArt] = useState('')

  const addToPlaylist = (resultURI, playlistid, playlistName) => {
    addTrackToPlaylist(resultURI, playlistid, token)
      .then(result => { 
        if (result.errorMsg === false) return
        else console.error(result.errorMsg)
      })
      setMessage({msg: `Song added to playlist: ${playlistName}`, needsUpdate: true})
  }

  // gets users playlists, for add-to-playlist button
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

  // cleanup arrays when playlist changes
  useEffect(() => {
    console.log('cleanup')
    setSongs([])
  },[contextURI, setSongs])

  // when player updates currentTrackID get new track info
  useEffect(() => {
    // only runs once player is ready otherwise value would be an empty string
    if(playerCBType !== '') {
      const getCurrentTrack = async () => {
        await axios.get(`https://api.spotify.com/v1/tracks/${currentTrackID}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }).then(result => { 
          if (result.data) return setCurrentItem(result.data)
          else console.error(result) 
        })
      }
      getCurrentTrack()
    }
  },[currentTrackID])

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
            console.log(result)
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

  return (
    <div style={!contextID ? {gridTemplateColumns:"unset"}:{}} className={playerIsHidden === true ? "playlist-wrap hide" : "playlist-wrap"}>
      
      <CurrentSong currentItem={currentItem} />

      <div className={!contextID ? "hidden" : "playlist"}>
        <div className="playlist-info-wrap">
          <img className="playlist-art" 
            src={playlistArt? playlistArt : 'no image found'} 
            alt={playlistArt? `${playlistName} playlist cover art` : 'no image found'} 
            />
          <span>
            <h1 style={{fontSize: '2.5rem'}}>{playlistName}</h1>
            <h2>{playlistDesc}</h2>
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
                <span key={index} data-index={index}
                  style={playlistOwner === userID ? {gridTemplateColumns: '18px 80px auto 40px'} : {}} 
                  className={currentTrackID === song.track.id ? "draggable selected" : "draggable"}> 
                  <span>{index+1}</span>
                  <button onClick={() => { changePlaylistSong(index, token, contextURI) }} className="play-song-btn">
                  <Tooltip tip={'Play'} />
                  <img src={
                    song.track.album.images.length === 0 ?
                    'no image found' :
                    song.track.album.images.length === 3 ?
                    song.track.album.images[2].url :
                    song.track.album.images[0].url
                    } alt={
                    song.track.album.images.length === 0 ?
                    'no image found' :
                    `${song.track.name} album art`
                    } />
                  </button>
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