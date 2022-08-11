import React from 'react';
import axios from "axios";
import CurrentSong from "./currentSong";
import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { LoginStatusCtx } from "./login";
import { changePlaylistSong } from "./api/changePlaylistSong";
import { removeTrackFromPlaylist } from "./api/removeTrackFromPlaylist"
import { changePlaylistOrder } from "./api/changePlaylistOrder"
import { addTrackToPlaylist } from "./api/addTrackToPlaylist"
import { showHideAddToPlaylistBtn } from "./func/showHideAddToPlaylistBtn"

function Playlist({ playerIsHidden }) {

  // global context
  const { token } = useContext(LoginStatusCtx)
  const { playerURIS, setPlayerURIS } = useContext(LoginStatusCtx)
  const { playerCBData, setPlayerCBData } = useContext(LoginStatusCtx)
  const { playlistID, setPlaylistID } = useContext(LoginStatusCtx)

  const [lyrics, setLyrics] = useState('')
  const [currentSong, setCurrentSong] = useState()
  const [songs, setSongs] = useState([])
  const [draggables, setDraggables] = useState([])
  const [playlistName, setPlaylistName] = useState('No playlist data')
  const [Username, setUsername] = useState('')
  const [playlists, setPlaylists] = useState([])
  // playlist update message
  const [showMessage, setShowMessage] = useState(false)
  const [message, setMessage] = useState('')

  // variables for drag and drop function
  let dragElIndex = 0
  let dragElNewIndex = 0
  let moveEl = null
  const container = useRef()
  const playlist = useRef()
  // Update draggables array after elements are created using useCallback
  const setDraggableElement = useCallback(node => {
    if(node != null) {
      // create array of draggable elements to add event listeners to
      setDraggables(current => [...current, node])
    }
  },[])
  let clone = null

  // song duration given in MS, convert to mins + secs
  function convertTime(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return (
      seconds === 60 ?
      (minutes+1) + ":00" :
      minutes + ":" + (seconds < 10 ? "0" : "") + seconds
    );
  }

  const changeSong = (index) => {
    changePlaylistSong(index, token, playerURIS)
  } 

  const removeTrack = async (trackURI) => {
    removeTrackFromPlaylist(trackURI, token, playlistID)
      .then(result => {
        if(result.length > 0) return setSongs(result)
        console.error(result)
      }) 
    setMessage('Song removed from playlist')
    setShowMessage(true)
    // hide message after 2 seconds
    setTimeout(() => {
      setShowMessage(false)
    }, 2000)
  }

  const changeOrder = async (dragElIndex, dragElNewIndex) => {
    setSongs([])
    setDraggables([])
    changePlaylistOrder(dragElIndex, dragElNewIndex, token, playlistID)
      .then(result => {
        if(result.length > 0) return setSongs(result)
        console.error(result)
      })
  }

  const addToPlaylist = async (resultURI, playlistid) => {
    addTrackToPlaylist(resultURI, playlistid, token)
      .then(result => console.error(result))
    setMessage('Song added to playlist')
    setShowMessage(true)
    // hide message after 2 seconds
    setTimeout(() => {
      setShowMessage(false)
    }, 2000)
  }

  const showBtn = (e) => {
    showHideAddToPlaylistBtn(e)
  }

  useEffect(() => {
    // get playlists for add to playlist functionality
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

  useEffect(() => {
    // when playlist changes, draggables array is emptied
    // we don't want to run through all this code on empty array
    // only run code when new draggables array is populated
    if(draggables.length === 0) return

    // add event listeners for drag & drop functionality
    draggables.forEach(element => {
      element.addEventListener('dragstart', drag)
    })

    function drag(e) {
      dragElIndex = draggables.indexOf(e.target)
      // create a clone which follows the mouse cursor
      clone = e.target.cloneNode(true)
      e.target.classList.add('move')
      playlist.current.appendChild(clone)
      clone.classList.add('clone')
      // set clones width to same as elements width (width varies with screen size)
      clone.style.width = `${e.target.offsetWidth}px`
      // adjust clone position if small device or large device
      if(window.innerWidth < 900) {
        clone.style.top = '50px'
      } else {
        clone.style.top = '-145px'
      }
      clone.style.left = `-${e.offsetX}px`
      clone.style.setProperty('--x', e.clientX + 'px')
      clone.style.setProperty('--y', e.clientY + 'px')
      clone.classList.add('dragging')
      // stop dragstart event listener to allow mousemove listener to take over
      e.preventDefault()
      document.addEventListener('mousemove', mousePos)
    }
  
    // on mousemove have clone follow the cursor
    function mousePos(e) {
      clone.style.setProperty('--x', e.clientX + 'px')
      clone.style.setProperty('--y', e.clientY + 'px')
      let nearestNode = getNearestNode(e.clientY)
      moveEl = document.querySelector('.move')
      // swap original element with nearest node
      container.current.insertBefore(moveEl, nearestNode)
      document.addEventListener('mouseup', placeClone)
    }
  
    function getNearestNode(y) {
      let nodes = [...document.querySelectorAll('.draggable:not(.clone)')]
      return nodes.reduce((closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2
        if(offset < 0 && offset > closest.offset) {
          return { offset:offset, element: child }
        } else {
          return closest
        }
      }, {offset: Number.NEGATIVE_INFINITY}).element
    }
  
    // on mouseup delete the clone and place original element in its current position
    function placeClone() {
      if (document.querySelector('.move')) {
        // get drag & dropped element reference
        const tempEl = document.querySelector('.move')
        document.querySelector('.move').classList.remove('move')
        document.removeEventListener('mousemove', mousePos)
        document.removeEventListener('mouseup', placeClone)
        clone.remove()
        // get nodelist from html and convert to array
        // check converted array for drag & drop elements new index in playlist
        const draggableNodeList = document.querySelectorAll('.draggable')
        const convertedNodelist = Array.from(draggableNodeList)
        dragElNewIndex = convertedNodelist.indexOf(tempEl)
        // update draggables array with elements new index
        draggables.splice(dragElNewIndex, 0, draggables.splice(dragElIndex, 1)[0]);
        // if position is unchanged, dont send api request
        if(dragElIndex === dragElNewIndex) return
        // delay changes to prevent bugs
        setTimeout(() => {
          changeOrder(dragElIndex, dragElNewIndex)
        }, 500)
      }
    }
    // cleanup event listeners on component re-render
    return () => {
      draggables.forEach(element => {
        element.removeEventListener('dragstart', drag)
      })
    }
  },[draggables])

  // cleanup arrays when playlist changes
  useEffect(() => {
    setDraggables([])
    setSongs([])
  },[playlistID])

  // when player sends callback state update, run this effect
  useEffect(() => {
    // only run effect on track updates
    if(playerCBData.type === 'track_update') {

      console.log('track update callback')

      const getCurrentTrack = async () => {
        await axios.get(`https://api.spotify.com/v1/tracks/${playerCBData.track_id}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }).then((res) => {
          setCurrentSong(res.data)
        }).catch(error => console.error(error))
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
            // can get owner
            setUsername(res.data.owner.display_name)
            setPlaylistName(res.data.name)
            setSongs(res.data.tracks.items)
          }).catch(error => console.error(error))
        }
        getPlaylistItems()
      }
    }
  },[playerCBData, playlistID, token])

  return (
    <div style={!playlistID ? {gridTemplateColumns:"unset"}:{}} className={playerIsHidden === true ? "playlist-wrap hide" : "playlist-wrap"} ref={playlist}>
      
      <CurrentSong currentSong={currentSong} />

      <div className={!playlistID ? "hidden" : "playlist"}>
        <h1 className="playlist-title">{playlistName}</h1>
        <div className="song-category">
          <h3>#</h3>
          <h3>Album</h3>
          <h3>Title</h3>
          <h3>Length</h3>
        </div>
        
        <div className="container" ref={container}>
          {
            playlistID? songs.map((song, index) => {
              return (
                <span key={index} className={playerCBData.track_id === song.track.id ? "draggable selected" : "draggable"} draggable="true" ref={setDraggableElement}>
                  <span>{index+1}</span>
                  <img src={song.track.album.images.length !== 0 ? song.track.album.images[0].url : ''} 
                  alt={song.track.album.images.length !== 0 ? `${song.track.name} Album art` : 'Image missing'}
                  draggable="false"
                  onClick={() => changeSong(index)}
                  />
                  <span className="play-song-tooltip">Play</span>
                  <span className="draggable-trackname">
                    <h1>{song.track.name}</h1>
                    <h2>
                      {song.track.artists.length > 1 
                      ? song.track.artists.map(artist => {
                      return `${artist.name}, `
                      })
                      : song.track.artists[0].name}
                    </h2>
                  </span>
                  <p className="song-length">{convertTime(song.track.duration_ms)}</p>
                  {
                    Username === 'Adam' ?
                    <button className="remove-track-btn" title="remove track from playlist" onClick={() => removeTrack(song.track.uri)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentcolor" width="10px" viewBox="0 0 320 400">{/* Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. */}<path d="M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z"/></svg>
                    </button>
                    :
                    <button className="add-to-playlist" onClick={(e) => showBtn(e.target)}>
                      <svg style={{pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg" fill="currentcolor" width="20px" viewBox="0 0 512 512">{/* Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. */}<path d="M0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84.02L256 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 .0003 232.4 .0003 190.9L0 190.9z"/></svg>
                      <span className={"choose-playlist"}>
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
      <div className={showMessage === true ? "playlist-update-message show" : "playlist-update-message"}>
        <h2>{message}</h2>
        <span className="triangle"></span>
      </div>
    </div>
  ) 
}

export default Playlist