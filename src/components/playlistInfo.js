import axios from "axios";
import CurrentSong from "./currentSong";
import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { GlobalContext } from "./login";
import { changePlaylistSong } from "../api/changePlaylistSong";
import { removeTrackFromPlaylist } from "../api/removeTrackFromPlaylist"
import { changePlaylistOrder } from "../api/changePlaylistOrder"
import { addTrackToPlaylist } from "../api/addTrackToPlaylist"
import { convertTime } from "./utils/convertTime"
import { sanitizeArtistNames } from "./utils/sanitizeArtistNames"
import { getNearestNode } from "./utils/getNearestNode"
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
  const [currentSong, setCurrentSong] = useState()
  const [playlistOwner, setPlaylistOwner] = useState('')
  const [playlistName, setPlaylistName] = useState('No playlist data')
  const [playlistDesc, setPlaylistDesc] = useState('')
  const [playlists, setPlaylists] = useState([])
  const [playlistArt, setPlaylistArt] = useState('')
  const [draggables, setDraggables] = useState([])
  const container = useRef()
  // Update draggables array after elements are created using useCallback
  const setDraggableElement = useCallback(node => {
    if(node != null) {
      // create array of draggable elements to add event listeners to
      setDraggables(current => [...current, node])
    }
  },[])
  const setNull = null

  const removeTrack = (trackURI) => {
    // empty songs array before re-populating with new data
    setSongs([])
    setDraggables([])

    removeTrackFromPlaylist(trackURI, token, contextID)
      .then(result => { 
        if (result.errorMsg === false) return setSongs(result.tracks)
        else console.error(result.errorMsg)
      })
    setMessage({msg: 'Song removed from playlist', needsUpdate: true})
  }

  const changeOrder = (startIndex, newIndex) => {
    // empty songs array before re-populating with new data
    setSongs([])
    setDraggables([])

    changePlaylistOrder(startIndex, newIndex, token, contextID)
      .then(result => { 
        if (result.errorMsg === false) return setSongs(result.tracks)
        else console.error(result.errorMsg)
      })
  }

  const addToPlaylist = (resultURI, playlistid) => {
    addTrackToPlaylist(resultURI, playlistid, token)
      .then(result => { 
        if (result.errorMsg === false) return
        else console.error(result.errorMsg)
      })

    document.querySelector('.show-p').classList.remove('show-p')
    setMessage({msg: 'Song added to playlist', needsUpdate: true})
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

  // Adds event listners for playlist items after the draggables array is filled
  // useCallback provides update when html draggables are rendered
  useEffect(() => {
    if(draggables.length === 0) return

    draggables.forEach(element => {
      element.addEventListener('dragstart', dragStart)
    })

    function dragStart(e) {
      let element = null
      element = e.target
      let startIndex = draggables.indexOf(element)
      // create a copy of the dragging element for effect
      let clone = element.cloneNode(true)
      clone.style.setProperty('--x', e.clientX + 'px')
      clone.style.setProperty('--y', e.clientY + 'px')
      document.body.appendChild(clone)
      clone.classList.add('clone')
      clone.style.left = `-${e.offsetX}px`
      clone.style.height = `${element.offsetHeight}px`
      clone.style.width = `${element.offsetWidth}px`
      clone.style.position = 'absolute'
      clone.style.top = '-55px'
      element.style.opacity = '0.3'
      // cancel drag listener, start listening for mousemove instead
      e.preventDefault()

      document.addEventListener('pointermove', mouseMove)
      function mouseMove(e) {
        // scroll up or down if draggable element touches top or bottom of scroll area
        let playlistEl = document.querySelector('.playlist')
        if (document.querySelector('.container').offsetTop < playlistEl.scrollTop) {
          if (e.clientY < 150) {
            document.querySelector('.playlist').scrollTo({top: (playlistEl.scrollTop - 200), left: 0, behavior: 'smooth'})
          }
        }
        if (e.clientY > playlistEl.offsetHeight + 100) { // +100 fpr header height
          document.querySelector('.playlist').scrollTo({top: (playlistEl.scrollTop + 200), left: 0, behavior: 'smooth'})
        }
        // update draggable position
        clone.style.setProperty('--x', e.clientX + 'px')
        clone.style.setProperty('--y', e.clientY + 'px')
        let nearestNode = getNearestNode(e.clientY, 'draggable')
        container.current.insertBefore(element, nearestNode)
      }

      document.addEventListener('pointerup', placeEl)
      function placeEl() {
        // remove listeners, place element, remove clone
        element.style.opacity = '1'
        document.querySelector('.clone')?.remove()
        document.removeEventListener('pointermove', mouseMove)
        document.removeEventListener('pointerup', placeEl)
        let newElLocation = container.current.querySelector(`[data-index="${startIndex}"]`)
        // get new index of moved element
        let htmlElToArray = Array.from(container.current.childNodes)
        let newIndex = htmlElToArray.indexOf(newElLocation)
        // Only send API request if element has moved positions
        if(startIndex === newIndex) return
        setTimeout(() => {
          changeOrder(startIndex, newIndex)
        }, 200)
      }
    }
    // cleanup event listeners on component re-render
    return () => {
      draggables.forEach(element => {
        element.removeEventListener('dragstart', dragStart)
      })
    }
  },[draggables])

  // cleanup arrays when playlist changes
  useEffect(() => {
    console.log('cleanup')
    setDraggables([])
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
          if (result.data) return setCurrentSong(result.data)
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
      
      <CurrentSong currentSong={currentSong} />

      <div className={!contextID ? "hidden" : "playlist"}>
        <div className="playlist-info-wrap">
          <img className="playlist-art" 
            src={playlistArt? playlistArt : 'no image found'} 
            alt={playlistArt? `${playlistName} playlist cover art` : 'no image found'} 
            />
          <span>
            <h1 className="playlist-title" style={{fontSize: '2.5rem'}}>{playlistName}</h1>
            <h2 className="playlist-desc">{playlistDesc}</h2>
          </span>
        </div>

        <div className="song-category">
          <h3>#</h3>
          <h3>Album</h3>
          <h3>Title</h3>
          <h3>Length</h3>
        </div>
        
        <div className="container" ref={container}>
          {
            contextURI?.includes('playlist') ? songs.map((song, index) => {
              if (song === null || song === undefined) return null
              return (
                <span key={index} data-index={index} className={currentTrackID === song.track.id ? "draggable selected" : "draggable"} draggable="true" ref={playlistOwner === userID ? setDraggableElement : setNull}>
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
                    <button className="remove-track-btn" onClick={() => removeTrack(song.track.uri)}>
                      <Tooltip tip={'Remove Track'} />
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="15px" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
                    </button>
                    :
                    <AddToPlaylistBtn 
                      track={song}
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