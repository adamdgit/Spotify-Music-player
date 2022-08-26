import { useContext, useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "react-router-dom"
import { LoginStatusCtx } from "../login";
import axios from "axios";
import { searchSongs } from "../api/search";
import { changePlaylistDetails } from "../api/changePlaylistDetails"
import { sanitizeArtistNames } from "../func/sanitizeArtistNames"
import { convertTime } from "../func/convertTime";
import { addTrackToPlaylist } from "../api/addTrackToPlaylist"
import { changePlaylistOrder } from "../api/changePlaylistOrder"
import { removeTrackFromPlaylist } from "../api/removeTrackFromPlaylist"
import { getNearestNode } from "../func/getNearestNode";

export default function EditPlaylist() {

  const { id } = useParams()
  // global context
  const { token } = useContext(LoginStatusCtx)
  const { songs, setSongs } = useContext(LoginStatusCtx)
  const { playlistID } = useContext(LoginStatusCtx)
  const { message, setMessage } = useContext(LoginStatusCtx)
  const { showMessage, setShowMessage } = useContext(LoginStatusCtx)

  const [playlistName, setPlaylistName] = useState('')
  const [playlistDesc, setPlaylistDesc] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPublic, setIsPublic] = useState(false)

  const [originalName, setOriginalName] = useState('')
  const [originalDesc, setOriginalDesc] = useState('')
  const [playlistData, setPlaylistData] = useState()
  // edit playlist tracks can be different from currently playing global songs
  const [tracks, setTracks] = useState([])
  const [draggables, setDraggables] = useState([])
  const container = useRef()
  // Update draggables array after elements are created using useCallback
  const setDraggableElement = useCallback(node => {
    if(node != null) {
      // create array of draggable elements to add event listeners to
      setDraggables(current => [...current, node])
    }
  },[])
  let clone = null

  const changeOrder = async (dragElIndex, dragElNewIndex) => {
    setTracks([])
    if (playlistID === playlistData.id) {
      setSongs([])
    }
    setDraggables([])
    changePlaylistOrder(dragElIndex, dragElNewIndex, token, id)
      .then(result => {
        if(result.length > 0) {
          // user can edit playlist that is not currently playing
          // we check if currently playing matches currently editing
          // and sync changes that are made
          if (playlistID === playlistData.id) {
            return setSongs(result)
          }
          return setTracks(result)
        }
        console.error(result)
      })
  }

  const removeTrack = async (trackURI) => {
    removeTrackFromPlaylist(trackURI, token, playlistData.id)
      .then(result => {
        if(result.length > 0) {
          // user can edit playlist that is not currently playing
          // we check if currently playing matches currently editing
          // and sync changes that are made
          if (playlistID === playlistData.id) {
            return setSongs(result)
          }
          return setTracks(result)
        }
        console.error(result)
      })
    setMessage('Song removed from playlist')
    setShowMessage(true)
    // hide message after 2 seconds
    setTimeout(() => {
      setShowMessage(false)
    }, 2000)
  }

  const changeDetails = async () => {
    if (playlistName === '' && playlistDesc === '') {
      alert('Please enter a name or description')
      return
    }
    changePlaylistDetails(token, id, playlistDesc, playlistName, isPublic)
    setMessage('Playlist details updated')
    setShowMessage(true)
    // hide message after 2 seconds
    setTimeout(() => {
      setShowMessage(false)
    }, 2000)
  }

  const addTrack = async (uri) => {
    addTrackToPlaylist(uri, id, token)
    .then(result => {
      if(result.length > 0) {
        if (playlistID === playlistData.id) {
          return setSongs(result)
        }
        return setTracks(result)
      }
      console.error(result)
    })
    setMessage('Track added to playlist')
    setShowMessage(true)
    // hide message after 2 seconds
    setTimeout(() => {
      setShowMessage(false)
    }, 2000)
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
        setTracks(res.data.tracks.items)
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

    if(draggables.length === 0) return

    draggables.forEach(element => {
      element.addEventListener('dragstart', dragStart)
    })

    function dragStart(e) {
      console.log('dragstart')
      let element = e.target
      let startIndex = draggables.indexOf(element)
      // create a copy of the dragging element for effect
      let clone = element.cloneNode(true)
      document.body.appendChild(clone)
      clone.classList.add('clone')
      clone.style.height = `${element.offsetHeight}px`
      clone.style.width = `${element.offsetWidth}px`
      clone.style.position = 'absolute'
      clone.style.top = '-55px'
      clone.style.left = `-${e.offsetX}px`
      element.style.opacity = '0.3'
      // cancel drag listener, start listening for mousemove instead
      e.preventDefault()

      document.addEventListener('mousemove', mouseMove)
      function mouseMove(e) {
        clone.style.setProperty('--x', e.clientX + 'px')
        clone.style.setProperty('--y', e.clientY + 'px')
        let nearestNode = getNearestNode(e.clientY)
        container.current.insertBefore(element, nearestNode)
      }

      document.addEventListener('mouseup', placeEl)
      function placeEl() {
        element.style.opacity = '1'
        document.querySelector('.clone')?.remove()
        document.removeEventListener('mousemove', mouseMove)
        document.removeEventListener('mouseup', placeEl)
        let newElLocation = container.current.querySelector(`[data-index="${startIndex}"]`)
        // get new index of moved element
        let htmlElToArray = Array.from(container.current.childNodes)
        let newIndex = htmlElToArray.indexOf(newElLocation)
        // Only send API request if element has moved positions
        console.log(startIndex, newIndex)
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

  return (
    <div className="page-wrap" style={{backgroundColor: 'var(--bg-blue)'}}>
      <div className="main-content" style={{backgroundColor: 'var(--primary-blue)'}}>

        <h1 className="edit-heading">Playlist editor:</h1>
        <div className="playlist-info">
          <span>
            <h1>{!playlistName ? originalName : playlistName}</h1>
            <h3>{!playlistDesc ? originalDesc : playlistDesc}</h3>
          </span>
          <button className="play" onClick={() => changeDetails()}>Save changes</button>
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
              <input 
                type="text" 
                className="edit-input" 
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="Change playlist name"
              />
            </span>
            <span className="change-details">
              <h3>Description:</h3>
              <input 
                type="text" 
                className="edit-input" 
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

        {playlistData? 
        <div className="edit-songlist" ref={container}>
          { // show global songs if playlists are the same, otherwise show selected playlist tracks
          playlistID === playlistData.id?
            songs.map((song, index) => {
              return (
                <span key={index} data-index={index} className="draggable" draggable="true" ref={setDraggableElement}>
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
                  <button className="remove-track-btn" title="remove track from playlist" onClick={() => removeTrack(song.track.uri)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentcolor" width="10px" viewBox="0 0 320 400">{/* Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. */}<path d="M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z"/></svg>
                  </button>
                </span>
              )
            }) 
            : 
            tracks.map((song, index) => {
              return (
                <span key={index} data-index={index} className="draggable" draggable="true" ref={setDraggableElement}>
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
                  <button className="remove-track-btn" title="remove track from playlist" onClick={() => removeTrack(song.track.uri)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentcolor" width="10px" viewBox="0 0 320 400">{/* Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. */}<path d="M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z"/></svg>
                  </button>
                </span>
              )
            })
          }
        </div>
        : <h1>No songs in playlist</h1>
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
              <button className="play" onClick={() => addTrack(track.uri)} >Add</button>
            </div>)
          })
          : <></>
          }
        </div>
       </div>
    </div>
  )
}