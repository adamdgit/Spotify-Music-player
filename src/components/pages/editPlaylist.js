import { useContext, useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "react-router-dom"
import { GlobalContext } from "../login";
import axios from "axios";
import { searchSongs } from "../../api/search";
import { changePlaylistDetails } from "../../api/changePlaylistDetails"
import { sanitizeArtistNames } from "../utils/sanitizeArtistNames"
import { addTrackToPlaylist } from "../../api/addTrackToPlaylist"
import { changePlaylistOrder } from "../../api/changePlaylistOrder"
import { removeTrackFromPlaylist } from "../../api/removeTrackFromPlaylist"
import { getNearestNode } from "../utils/getNearestNode";
import EditPlaylistItem from "../EditPlaylistItem";
import Loading from "../Loading";

export default function EditPlaylist() {

  const { id } = useParams()
  // global context
  const { token } = useContext(GlobalContext)
  const { songs, setSongs } = useContext(GlobalContext)
  const { contextID } = useContext(GlobalContext)
  const { setMessage } = useContext(GlobalContext)

  const [playlistName, setPlaylistName] = useState('')
  const [playlistDesc, setPlaylistDesc] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPublic, setIsPublic] = useState(false)
  const [error, setError] = useState(false)
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

  const changeOrder = (dragElIndex, dragElNewIndex) => {
    setTracks([])
    setDraggables([])
    // if currently playing playlist matches currently editing
    // empty songs to prepare for loading new songs from API
    if (contextID === playlistData.id) {
      setSongs([])
    }
    changePlaylistOrder(dragElIndex, dragElNewIndex, token, id)
      .then(result => { 
        if (result.errorMsg === false) {
          if (contextID === playlistData.id) {
            return setSongs(result.tracks)
          }
          return setTracks(result.tracks)
        }
        else console.error(result.errorMsg)
      })
  }

  const removeTrack = (trackURI) => {
    removeTrackFromPlaylist(trackURI, token, playlistData.id)
      .then(result => { 
        if (result.errorMsg === false) {
          if (contextID === playlistData.id) {
            return setSongs(result.tracks)
          }
          return setTracks(result.tracks)
        }
        else console.error(result.errorMsg)
      })
    setMessage({msg: 'Song removed from playlist', needsUpdate: true})
  }

  const changeDetails = (e) => {
    e.preventDefault()
    // simple validation
    if (playlistName === '' && playlistDesc === '') {
      return setError(true)
    }
    if (playlistName === '' && playlistDesc !== '') {
      setError(false)
      changePlaylistDetails(token, id, playlistDesc, originalName, isPublic)
        .then(result => {
          if (result.errorMsg === false) return
          else console.error(result.errorMsg)
        })
      setOriginalDesc(playlistDesc)
      setMessage({msg: 'Playlist details updated', needsUpdate: true})
      return
    }
    if (playlistName !== '' && playlistDesc === '') {
      setError(false)
      changePlaylistDetails(token, id, originalDesc, playlistName, isPublic)
        .then(result => {
          if (result.errorMsg === false) return
          else console.error(result.errorMsg)
        })
      setOriginalName(playlistName)
      setMessage({msg: 'Playlist details updated', needsUpdate: true})
      return
    }
    setError(false)
    changePlaylistDetails(token, id, playlistDesc, playlistName, isPublic)
      .then(result => {
        if (result.errorMsg === false) return
        else console.error(result.errorMsg)
      })
    setOriginalDesc(playlistDesc)
    setOriginalName(playlistName)
    setMessage({msg: 'Playlist details updated', needsUpdate: true})
  }

  const addTrack = (uri) => {
    addTrackToPlaylist(uri, id, token)
    .then(result => {
      if (result.errorMsg === false) {
        if (contextID === playlistData.id) {
          return setSongs(result.tracks)
        }
        return setTracks(result.tracks)
      }
      else console.error(result.errorMsg)
    })
    setMessage({msg: 'Track added to playlist', needsUpdate: true})
  }

  useEffect(() => {

    if(!id) return

    const getPlaylists = async () => {
      console.log('get playlists data')
      await axios.get(`https://api.spotify.com/v1/playlists/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }).then((res) => {
        if (res.data) {
          setPlaylistData(res.data)
          setTracks(res.data.tracks.items)
          setOriginalName(res.data.name)
          setOriginalDesc(res.data.description)
        } else { console.error(res) }
      })
    }
    getPlaylists()

  },[token, id])

  // cleanup arrays when playlist changes
  useEffect(() => {
    if (contextID === playlistData?.id) {
      setDraggables([])
      setSongs([])
    }
  },[contextID, setSongs])

  useEffect(() => {
    if(query === '') return
    // set delay for search requests
    const delaySearch = setTimeout(() => {
      const search = async () => {
        searchSongs(token, query)
          .then(result => {
            if(result.errorMsg === false) return setResults(result.searchResult)
            else console.error(result.errorMsg)
          })
      }
      search()
    }, 300)
    // remove timeout function
    return () => {
      clearTimeout(delaySearch)
    }
  },[query, token])

  // Adds event listners for playlist items after the draggables array is filled
  // useCallback provides update when html draggables are rendered
  useEffect(() => {

    if(draggables.length === 0) return

    draggables.forEach(element => {
      element.children[4].addEventListener('mousedown', dragStart)
      element.children[4].addEventListener('touchstart', dragStart)
    })

    function dragStart(e) {
      let element = e.target.parentElement
      let startIndex = draggables.indexOf(element)
      // create a copy of the dragging element for effect
      let clone = element.cloneNode(true)
      document.getElementById('root').appendChild(clone)
      clone.classList.add('clone')
      if (e.type === 'touchstart') {
        clone.style.setProperty('--x', e.changedTouches[0].clientX + 'px')
        clone.style.setProperty('--y', e.changedTouches[0].clientY + 'px')
        clone.style.left = `-${e.changedTouches[0].pageX}px`
      } else {
        clone.style.setProperty('--x', e.clientX + 'px')
        clone.style.setProperty('--y', e.clientY + 'px')
        clone.style.left = `-${e.target.offsetLeft}px`
      }
      clone.style.height = `${element.offsetHeight}px`
      clone.style.width = `${element.offsetWidth}px`
      clone.style.position = 'absolute'
      clone.style.top = '-55px'
      element.style.opacity = '0.3'
      // cancel drag listener, start listening for pointermove instead
      e.preventDefault()

      document.addEventListener('mousemove', mouseMove)
      document.addEventListener('touchmove', mouseMove)
      function mouseMove(e) {
        let nearestNode = null
        if (e.type === 'touchmove') {
          clone.style.setProperty('--x', e.changedTouches[0].clientX + 'px')
          clone.style.setProperty('--y', e.changedTouches[0].clientY + 'px')
          nearestNode = getNearestNode(e.changedTouches[0].clientY, 'edit-draggable')
        } else {
          clone.style.setProperty('--x', e.clientX + 'px')
          clone.style.setProperty('--y', e.clientY + 'px')
          nearestNode = getNearestNode(e.clientY, 'edit-draggable')
        }
        // prevents constant rendering of element, only inserts when element is different
        if (nearestNode !== element && nearestNode !== element.nextSibling) {
          container.current.insertBefore(element, nearestNode)
        }
      }

      document.addEventListener('mouseup', placeEl)
      document.addEventListener('touchend', placeEl)
      function placeEl() {
        // remove listeners, place element, remove clone
        element.style.opacity = '1'
        document.querySelector('.clone')?.remove()
        document.removeEventListener('mousemove', mouseMove)
        document.removeEventListener('mouseup', placeEl)
        document.removeEventListener('touchmove', mouseMove)
        document.removeEventListener('touchend', placeEl)
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
        element.removeEventListener('mousedown', dragStart)
        element.removeEventListener('touchstart', dragStart)
      })
    }
  },[draggables])

  return (
    <div className="page-wrap">
      <div className="main-content">

        <h1 className="edit-heading">Playlist editor:</h1>
        <div className="playlist-info">
          <span style={{display:'grid', gap: '1rem'}}>
            <h1 style={{fontSize: '3.5rem'}}>{!playlistName ? originalName : playlistName}</h1>
            <h3 style={{fontSize: '2rem'}}>{!playlistDesc ? originalDesc : playlistDesc}</h3>
          </span>
        </div>
     {playlistData ?
     <>
        <div className="create-playlist">
          {
            playlistData.images.length === 0 ? 
            <span style={{display: 'grid', placeItems: 'center', 
              height: '300px', width: '300px', border: '2px solid white'}}>
              <svg role="img" fill="currentcolor" height="64" width="64" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 3h15v15.167a3.5 3.5 0 11-3.5-3.5H19V5H8v13.167a3.5 3.5 0 11-3.5-3.5H6V3zm0 13.667H4.5a1.5 1.5 0 101.5 1.5v-1.5zm13 0h-1.5a1.5 1.5 0 101.5 1.5v-1.5z"></path></svg>
            </span>
            : 
            <img 
              src={ playlistData.images[0].url } 
              alt={ `${playlistData.name} playlist art` }
            /> 
          }
          <form className="user-input-wrap">
            <span className="change-details">
              <h3>Name:</h3>
              <input
                style={error === true ? {border: '1px solid red'} : {}}
                id="name"
                type="text" 
                className="edit-input" 
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="Change playlist name"
              />
            </span>
            <span className="change-details">
              <h3>Description:</h3>
              <input 
                style={error === true ? {border: '1px solid red'} : {}}
                id="description"
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
            <button className="play save-changes" onClick={(e) => changeDetails(e)}>Save changes</button>
          </form>
        </div>

        <h2 style={{textAlign: 'center', marginBottom: '2rem'}}>Edit tracks:</h2>

        <div className="edit-songlist" ref={container}>
          {tracks.length === 0? 
            <span className="edit-draggable">
              <span>{1}</span>
              <svg role="img" fill="currentcolor" height="32" width="32" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 3h15v15.167a3.5 3.5 0 11-3.5-3.5H19V5H8v13.167a3.5 3.5 0 11-3.5-3.5H6V3zm0 13.667H4.5a1.5 1.5 0 101.5 1.5v-1.5zm13 0h-1.5a1.5 1.5 0 101.5 1.5v-1.5z"></path></svg>
              <span className="draggable-trackname">
                <h1>Song name..</h1>
                <p>Artists..</p>
              </span>
              <button className="remove-track-btn" 
                title="remove track from playlist"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="15px" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
              </button>
              <button className="drag-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM64 256c0-17.7 14.3-32 32-32H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H96c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"/>
                </svg>
              </button>
            </span> : <></>
          }
          {contextID === playlistData.id?
            songs.map((song, index) => {
              return (
                <EditPlaylistItem 
                  key={index}
                  song={song} 
                  index={index} 
                  func={removeTrack} 
                  setDraggableElement={setDraggableElement}
                />
              )
            }) 
            : 
            tracks.map((song, index) => {
              return (
                <EditPlaylistItem 
                  key={index}
                  song={song} 
                  index={index} 
                  func={removeTrack} 
                  setDraggableElement={setDraggableElement}
                />
              )
            })
          }
        </div>
      </>
      : <Loading loadingMsg={'Loading playlist info...'}/>
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