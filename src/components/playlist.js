import { useState, useEffect, useRef, useContext, useCallback } from "react";
import React from 'react';
import { LoginStatusCtx } from "./login";
import axios from "axios";
import GetCurrentlyPlaying from "./api/getCurrentlyPlaying";

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
  let dragElIndex = 0
  let dragElNewIndex = 0
  let moveEl = null

  // variables for drag and drop function
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

  function changePlaylistSong(offset){
    //setPlayerOffset(offset)
    //setPlayerURIS('')
    return axios({ 
      method: 'put', 
      url: 'https://api.spotify.com/v1/me/player/play', 
      headers: { 'Authorization': 'Bearer ' + token }, 
      data: {
        "context_uri": `${playerURIS}`,
        "offset": { "position": offset }
      }
    })
  }

  // remove selected track from playlist and re-load playlist
  async function removeTrackFromPlaylist(trackURI) {
    // delete track from playlist
    await axios({ 
      method: 'delete', 
      url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks`, 
      headers: { 'Authorization': 'Bearer ' + token }, 
      data: {
        "tracks": [{
          "uri": `${trackURI}`
        }]
      }
    }).catch(error => console.error(error))
    // get newly updated playlist items
    await axios.get(`https://api.spotify.com/v1/playlists/${playlistID}/tracks?limit=50`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    }).then((res) => {
      setSongs(res.data.items)
    }).catch(error => console.error(error))
  }

  // whenever new playlist items (draggables) are created add event listeners
  useEffect(() => {

    // todo: only allow re-ordering of user owned playlists
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
      clone.style.top = '-145px'
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
        // send playlist index changes to API
        return axios({ 
          method: 'put', 
          url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks`, 
          headers: { 'Authorization': 'Bearer ' + token }, 
          data: {
            "range_start": dragElIndex, // first item to change
            "insert_before": dragElNewIndex, // location to insert item
            "range_length": 1 // number of items to change
          }
        })

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

      let currentTrackID = playerCBData.track_id

      const getCurrentTrack = async () => {
        await axios.get(`https://api.spotify.com/v1/tracks/${currentTrackID}`, {
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
          await axios.get(`https://api.spotify.com/v1/playlists/${playlistID}/tracks?limit=50`, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          }).then((res) => {
            setSongs(res.data.items)
          }).catch(error => console.error(error))
        }
        getPlaylistItems()
      }
    }
  },[playerCBData, playlistID, token])

  return (
    <div className={playerIsHidden === true ? "playlist-wrap hide" : "playlist-wrap"} ref={playlist}>
      
      <GetCurrentlyPlaying currentSong={currentSong}/>

      <div className="playlist">
        <h1 className="playlist-title">{}</h1>
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
                song.track === null ? 
                <span key={index} className={"draggable"} draggable="true" ref={setDraggableElement}>
                  <span>{index+1}</span>
                  <img src='' alt='' />
                  <span>
                    <h1>Track unavailable</h1>
                    <span></span>
                  </span>
                  <span>
                    <p className="song-length"></p>
                  </span>
                </span>
                :
                <span key={index} className={playerCBData.track_id === song.track.id ? "draggable selected" : "draggable"} draggable="true" ref={setDraggableElement}>
                  <span>{index+1}</span>
                  <img src={song.track.album.images.length !== 0 ? song.track.album.images[0].url : ''} 
                  alt={song.track.album.images.length !== 0 ? `${song.track.name} Album art` : 'Image missing'}
                  draggable="false"
                  onClick={() => changePlaylistSong(index)}
                  />
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
                  <button className="remove-track-btn" title="remove track from playlist" onClick={() => removeTrackFromPlaylist(song.track.uri)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentcolor" width="10px" viewBox="0 0 320 400">{/* Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. */}<path d="M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z"/></svg>
                  </button>
                </span>
              )
            }) : <h1>No playlist available</h1>
          }
        </div>
      </div>
    </div>
  ) 
}

export default Playlist