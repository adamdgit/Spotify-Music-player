import axios from "axios";
import CurrentSong from "./currentSong";
import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { GlobalContext } from "./login";
import { changePlaylistSong } from "./api/changePlaylistSong";
import { removeTrackFromPlaylist } from "./api/removeTrackFromPlaylist"
import { changePlaylistOrder } from "./api/changePlaylistOrder"
import { addTrackToPlaylist } from "./api/addTrackToPlaylist"
import { showHideAddToPlaylistBtn } from "./func/showHideAddToPlaylistBtn"
import { convertTime } from "./func/convertTime"
import { sanitizeArtistNames } from "./func/sanitizeArtistNames"
import { getNearestNode } from "./func/getNearestNode"
import { getUserPlaylists } from "./api/getUserPlaylists"

function PlaylistInfo({ playerIsHidden }) {

  // global context
  const { token } = useContext(GlobalContext)
  const { contextURI } = useContext(GlobalContext)
  const { playerCBData } = useContext(GlobalContext)
  const { playlistID } = useContext(GlobalContext)
  const { songs, setSongs } = useContext(GlobalContext)
  const { userID } = useContext(GlobalContext)
  // playlist update message
  const { setMessage } = useContext(GlobalContext)

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

  const removeTrack = (trackURI) => {
    removeTrackFromPlaylist(trackURI, token, playlistID)
      .then(result => { 
        if (result.length === 0) return setSongs([])
        if (result.length > 0) return setSongs(result)
        else console.error(result) 
      })
    setMessage('Song removed from playlist')
  }

  const changeOrder = (startIndex, newIndex) => {
    // changes order of playlist item
    setSongs([])
    setDraggables([])
    changePlaylistOrder(startIndex, newIndex, token, playlistID)
      .then(result => { 
        if (result.length === 0) return setSongs([])
        if (result.length > 0) return setSongs(result)
        else console.error(result) 
      })
  }

  const addToPlaylist = (resultURI, playlistid) => {
    addTrackToPlaylist(resultURI, playlistid, token)
      .then(result => { 
        if (result) console.error(result) 
      })

    document.querySelector('.show-p').classList.remove('show-p')
    setMessage('Song added to playlist')
  }

  useEffect(() => {
    getUserPlaylists(token)
      .then(result => { 
        if (result.length === 0) return setPlaylists([])
        if (result.length > 0) return setPlaylists(result)
        else console.error(result) 
      })
  },[token])

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
    setDraggables([])
    setSongs([])
  },[playlistID, setSongs])

  // when player sends callback state update, run this effect
  useEffect(() => {
    // only run effect on track updates
    if(playerCBData.type === 'track_update' || playerCBData.type === 'player_ready') {

      const getCurrentTrack = async () => {
        await axios.get(`https://api.spotify.com/v1/tracks/${playerCBData.track_id}`, {
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

      // only run when playlist is playing, not single track
      if(playlistID) {
        const getPlaylistItems = async () => {
          await axios.get(`https://api.spotify.com/v1/playlists/${playlistID}?limit=50`, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          }).then((res) => {
            if (res.data) {
              setPlaylistArt(res.data.images[0].url)
              setPlaylistDesc(res.data.description)
              setPlaylistName(res.data.name)
              setSongs(res.data.tracks.items)
              setPlaylistOwner(res.data.owner.id)
            } else { console.error(res) }
          })
        }
        getPlaylistItems()
      }
    }

  },[playerCBData, token])

  return (
    <div style={!playlistID ? {gridTemplateColumns:"unset"}:{}} className={playerIsHidden === true ? "playlist-wrap hide" : "playlist-wrap"}>
      
      <CurrentSong currentSong={currentSong} />

      <div className={!playlistID ? "hidden" : "playlist"}>
        <div className="playlist-info-wrap">
          <img className="playlist-art" 
            src={playlistArt? playlistArt : 'no image found'} 
            alt={playlistArt? `${playlistName} playlist cover art` : 'no image found'} 
            />
          <span>
            <h1 className="playlist-title" style={{fontSize: '3rem'}}>{playlistName}</h1>
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
            playlistID? songs.map((song, index) => {
              if (song === null) return
              return (
                <span key={index} data-index={index} className={playerCBData.track_id === song.track.id ? "draggable selected" : "draggable"} draggable="true" ref={setDraggableElement}>
                  <span>{index+1}</span>
                  <button onClick={() => changePlaylistSong(index, token, contextURI)} className="play-song-btn" >
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
                  <span className="play-song-tooltip">Play</span>
                  <span className="draggable-trackname">
                    <h1>{song.track.name}</h1>
                    <p>{sanitizeArtistNames(song.track.artists)}</p>
                  </span>
                  <p className="song-length">{convertTime(song.track.duration_ms)}</p>
                  {
                    playlistOwner === userID ?
                    <button className="remove-track-btn" title="remove track from playlist" onClick={() => removeTrack(song.track.uri)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentcolor" width="10px" viewBox="0 0 320 400">{/* Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. */}<path d="M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z"/></svg>
                    </button>
                    :
                    <button className="add-to-playlist" onClick={(e) => showHideAddToPlaylistBtn(e.target)}>
                      <svg style={{pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg" fill="currentcolor" width="20px" viewBox="0 0 512 512">{/* Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. */}<path d="M0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84.02L256 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 .0003 232.4 .0003 190.9L0 190.9z"/></svg>
                      <span className="choose-playlist">
                        <h3>Add to playlist:</h3>
                        <ul>
                          {
                            playlists? playlists.map((playlist, index) => {
                              return <li key={index} style={{listStyle:"none"}} onClick={() => addToPlaylist(song.track.uri, playlist.id)}>{playlist.name}</li>
                            })
                            : <li>No playlists found</li>
                          }
                        </ul>
                      </span>
                    </button>
                  }
                </span>
              )
            }) : <h1>No playlist available</h1>
          }
        </div>
      </div>
    </div>
  ) 
}

export default PlaylistInfo