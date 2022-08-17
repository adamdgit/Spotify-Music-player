import { useContext, useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "react-router-dom"
import { LoginStatusCtx } from "../login";
import { searchSongs } from "../api/search";
import { sanitizeArtistNames } from "../func/sanitizeArtistNames"
import { changePlaylistDetails } from "../api/changePlaylistDetails"
import { convertTime } from "../func/convertTime";
import { addTrackToPlaylist } from "../api/addTrackToPlaylist"
import { changePlaylistOrder } from "../api/changePlaylistOrder"
import axios from "axios";

export default function EditPlaylist() {

  const { token } = useContext(LoginStatusCtx)
  const { id } = useParams()

  const [playlistName, setPlaylistName] = useState()
  const [playlistDesc, setPlaylistDesc] = useState()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPublic, setIsPublic] = useState(false)

  const [originalName, setOriginalName] = useState('')
  const [originalDesc, setOriginalDesc] = useState('')
  const [playlistData, setPlaylistData] = useState()
  const [songs, setSongs] = useState([])

  // variables for drag and drop function
  const [draggables, setDraggables] = useState([])
  let dragElIndex = 0
  let dragElNewIndex = 0
  let moveEl = null
  const container = useRef()
  const content = useRef()
  // Update draggables array after elements are created using useCallback
  const setDraggableElement = useCallback(node => {
    if(node != null) {
      // create array of draggable elements to add event listeners to
      setDraggables(current => [...current, node])
    }
  },[])
  let clone = null

  const changeOrder = async (dragElIndex, dragElNewIndex) => {
    setSongs([])
    setDraggables([])
    changePlaylistOrder(dragElIndex, dragElNewIndex, token, id)
      .then(result => {
        if(result.length > 0) return setSongs(result)
        console.error(result)
      })
  }

  useEffect(() => {

    if(!id) return

    const getPlaylists = async () => {
      await axios.get(`https://api.spotify.com/v1/playlists/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }).then((res) => {
        console.log(res.data)
        setPlaylistData(res.data)
        setSongs(res.data.tracks.items)
        setOriginalName(res.data.name)
        setOriginalDesc(res.data.description)
      }).catch(error => console.error(error))
    }
    getPlaylists()

  },[])

  useEffect(() => {
    if(query === '') return
    // set delay for search requests
    const delaySearch = setTimeout(() => {
      const search = async () => {
        searchSongs(token, query)
          .then(result => {
            if(result.length !== 0) return setResults(result)
            return console.error(result)
          })
      }
      search()
    }, 300)
    // remove timeout function
    return () => {
      clearTimeout(delaySearch)
    }
  },[query, token])

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
      content.current.appendChild(clone)
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
      let nodes = [...container.current.querySelectorAll('.draggable:not(.clone)')]
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
        const draggableNodeList = container.current.querySelectorAll('.draggable')
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

  return (
    <div className="page-wrap" style={{backgroundColor: 'var(--bg-blue)'}} ref={content}>
      <div className="main-content" style={{backgroundColor: 'var(--primary-blue)'}}>

        <h1 className="edit-heading">Playlist editor:</h1>
        <div className="playlist-info">
          <span>
            <h1>{!playlistName ? originalName : playlistName}</h1>
            <h3>{!playlistDesc ? originalDesc : playlistDesc}</h3>
          </span>
          <button className="play" onClick={() => changePlaylistDetails(token, id, playlistDesc, playlistName, isPublic)}>Save changes</button>
        </div>

        <div className="create-playlist">
        {!playlistData ?
          <h1>No playlist data found</h1> :
          <img src={
            playlistData.images.length === 0 ?
            'no image found' :
            playlistData.images[0].url
            } alt={
              playlistData.images.length === 0 ?
            'no image found' :
            `${playlistData.name} playlist art`
            }/> 
        }
          <span className="user-input-wrap">
            <span className="change-details">
              <h3>Name:</h3>
              <input type="text" className="edit-input" 
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="Change playlist name"
              />
            </span>
            <span className="change-details">
              <h3>Description:</h3>
              <input type="text" className="edit-input" 
                onChange={(e) => setPlaylistDesc(e.target.value)}
                placeholder="Change playlist description"
              />
            </span>
            <span className="change-details" style={{gridTemplateColumns: '130px 20px 1fr'}}>
              <h3>Make Public?</h3>            
              <input type="checkbox" onClick={(e) => setIsPublic(e.target.checked)}/>
              <p>(Leave unchecked for private playlist)</p>
            </span>
          </span>
        </div>

        {songs ? 
        <div className="edit-songlist" ref={container}>
          {songs.length === 0 ? 
            <p>No songs added yet, use the searchbar below to add some</p> :
            songs.map((song, index) => {
              return (
                <span key={index} className="draggable" draggable="true" ref={setDraggableElement}>
                  <span>{index+1}</span>
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
                    } draggable="true" />
                  <span className="play-song-tooltip">Play</span>
                  <span className="draggable-trackname">
                    <h1>{song.track.name}</h1>
                    <p>{sanitizeArtistNames(song.track.artists)}</p>
                  </span>
                  <p className="song-length">{convertTime(song.track.duration_ms)}</p>
                  <button className="remove-track-btn" title="remove track from playlist">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentcolor" width="10px" viewBox="0 0 320 400">{/* Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. */}<path d="M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z"/></svg>
                  </button>
                </span>
              )
            })
          }
        </div>
        : <h1>no playlist data</h1>
        }
      </div>

      <div className="search-songs-wrap">
        <h2>Find songs to add to playlist: {!playlistName ? originalName : playlistName}</h2>
        <div className="search-bar" style={{maxWidth: '500px'}}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="search-btn" fill="currentcolor" width="20px"><path d="M500.3 443.7l-119.7-119.7c27.22-40.41 40.65-90.9 33.46-144.7C401.8 87.79 326.8 13.32 235.2 1.723C99.01-15.51-15.51 99.01 1.724 235.2c11.6 91.64 86.08 166.7 177.6 178.9c53.8 7.189 104.3-6.236 144.7-33.46l119.7 119.7c15.62 15.62 40.95 15.62 56.57 0C515.9 484.7 515.9 459.3 500.3 443.7zM79.1 208c0-70.58 57.42-128 128-128s128 57.42 128 128c0 70.58-57.42 128-128 128S79.1 278.6 79.1 208z"></path></svg>
          <input type="search" placeholder="Search..." 
            className="search" 
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="results-wrap">
          { results.length !== 0 ? results.tracks.items.map((track, index) => {
          return (
            <div className="add-song-result" key={index}>
              <img src={
                track.album.images.length === 0 ?
                'no image found' :
                track.album.images.length === 3 ?
                track.album.images[2].url :
                track.album.images[0].url
                } alt={
                track.album.images.length === 0 ?
                'no image found' :
                `${track.name} album art`
                }/>
              <span>
                <h3>{track.name}</h3>
                <p>{sanitizeArtistNames(track.artists)}</p>
              </span>
              <button className="play" onClick={() => addTrackToPlaylist(track.uri, id, token)} >Add</button>
            </div>)
          })
          : <></>
          }
        </div>
       </div>
    </div>
  )
}