import { useState, useEffect, useRef, useContext, useCallback } from "react";
import React from 'react';
import { LoginStatusCtx } from "./login";
import axios from "axios";

function Playlist({ playerIsHidden }) {

  // global context
  const { token, setToken } = useContext(LoginStatusCtx)
  const { playlistData, setPlaylistData } = useContext(LoginStatusCtx)
  const { playerCBData, setPlayerCBData } = useContext(LoginStatusCtx)

  const [lyrics, setLyrics] = useState('')
  const [currentSong, setCurrentSong] = useState()
  const [songs, setSongs] = useState([])
  const [draggables, setDraggables] = useState([])

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
      seconds == 60 ?
      (minutes+1) + ":00" :
      minutes + ":" + (seconds < 10 ? "0" : "") + seconds
    );
  }

  function changePlaylistSong(offset){
    setPlaylistData({
      uris: playlistData.uris,
      play: true,
      autoplay: true,
      offset: offset,
      playlist_id: playlistData.playlist_id,
      playlist_name: playlistData.playlist_name,
      playlist_uri: playlistData.playlist_uri,
      playlist_image: playlistData.playlist_image,
      playlist_tracks_href: playlistData.playlist_tracks_href,
      playlist_desc: playlistData.playlist_desc
    })
  }

  // whenever new playlist items (draggables) are created add event listeners
  useEffect(() => {
    // saves draggable elements to an array to prevent cleanup errors
    // otherwise cleanup will say there are no eventlisteners to remove
    let elements = []
    draggables.forEach(element => {
      elements.push(element)
      element.addEventListener('dragstart', drag)
    })

    function drag(e) {
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
      const moveEl = document.querySelector('.move')
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
        document.querySelector('.move').classList.remove('move')
        document.removeEventListener('mousemove', mousePos)
        document.removeEventListener('mouseup', placeClone)
        clone.remove()
  
        /*
        const reorderPlaylist = async () => {
          await axios.put(`https://api.spotify.com/v1/playlists/${playlistData.playlist_id}/tracks`, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            data: {
              "range_start": 1,
              "insert_before": 3,
              "range_length": 2
            }
          }).then((res) => {
            console.log(res.data)
          }).catch(error => console.error(error))
        }
        reorderPlaylist()
        */
  
      }
    }

    // cleanup event listeners on component re-render
    return () => {
      elements.forEach(element => {
        element.removeEventListener('dragstart', drag)
      })
    }
    
  },[draggables])

  // when player sends callback state update, run this effect
  useEffect(() => {

    // only run effect on track updates
    if(playerCBData.type === 'track_update') {
      console.log('track update run')

      let Playlist_ID = playlistData.playlist_id
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

      const getPlaylistItems = async () => {
        await axios.get(`https://api.spotify.com/v1/playlists/${Playlist_ID}/tracks?limit=25`, {
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

  },[playerCBData])

  return (
    <div className={playerIsHidden === true ? "playlist-wrap hide" : "playlist-wrap"} ref={playlist}>
      
      <div className="song-wrap">
          {
            currentSong ?
              <span className="song-info">
                <h3>Playing: {currentSong.name}</h3>
                <img className="album-large" src={currentSong.album.images[0].url} alt={`${currentSong.album.name} Album art`} />
                <ul>
                  <li><h3>Artists:</h3>
                    {currentSong.artists.length > 1 
                    ? currentSong.artists.map(artist => {
                    return `${artist.name}, `
                    })
                    : currentSong.artists[0].name
                    }
                  </li>
                  <li><h3>Album: </h3>{currentSong.album.name}</li>
                  <li><h3>Released: </h3>{currentSong.album.release_date}</li>
                </ul>
              </span>
            : 
              <span className="song-info">
                Play a song to show data
              </span>
          }

        <div className="lyrics-wrap">
          <h2>Lyrics</h2>
          <span className='lyrics'>
            {lyrics}
          </span>
        </div>
        
      </div>

      <div className="playlist">
        <h1 className="playlist-title">{playlistData.playlist_name}</h1>
        <div className="song-category">
          <h3>#</h3>
          <h3>Album</h3>
          <h3>Title</h3>
          <h3>Length</h3>
        </div>
        
        <div className="container" ref={container}>
          {
            playlistData.playlist_id ? songs.map((song, index) => {
              return (
                <span key={index} className={currentSong.name === song.track.name ? "draggable selected" : "draggable"} draggable="true" ref={setDraggableElement}>
                  <span>{index+1}</span>
                  <img src={song.track.album.images.length !== 0 ? song.track.album.images[0].url : ''} 
                  alt={song.track.album.images.length !== 0 ? `${song.track.name} Album art` : 'Image missing'} 
                  draggable="false"
                  onClick={() => changePlaylistSong(index)}
                  />
                  <span>
                    <h1>{song.track.name}</h1>
                    <h2>
                      {song.track.artists.length > 1 
                      ? song.track.artists.map(artist => {
                      return `${artist.name}, `
                      })
                      : song.track.artists[0].name}
                    </h2>
                  </span>
                  <span>
                    <p className="song-length">{convertTime(song.track.duration_ms)}</p>
                  </span>
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