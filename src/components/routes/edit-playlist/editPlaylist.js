import { useContext, useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "react-router-dom"
import { GlobalContext } from "../login";
import axios from "axios";
import { changePlaylistOrder } from "../../../api/changePlaylistOrder"
import { removeTrackFromPlaylist } from "../../../api/removeTrackFromPlaylist"
import { getNearestNode } from "../../utils/getNearestNode";
import EditPlaylistItem from "./EditPlaylistItem";
import Loading from "../../Loading";
import EditSearchResults from "./EditSearchResults";
import BlankSongResult from "./BlankSongResult";
import EditPlaylistDetails from "./EditPlaylistDetails";

export default function EditPlaylist() {

  const { id } = useParams()
  // global context
  const { token } = useContext(GlobalContext)
  const { songs, setSongs } = useContext(GlobalContext)
  const { contextID } = useContext(GlobalContext)
  const { setMessage } = useContext(GlobalContext)

  const [playlistName, setPlaylistName] = useState('')
  const [playlistDesc, setPlaylistDesc] = useState('')
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
  // auto scroll offset when re-ordering playlist items
  let offset = 0
  let timer = null

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

  const cursorTouchingEdge = (e) => {
    clearTimeout(timer);
    if (e.clientY < 200) {
      timer = setTimeout(() => {
        console.log('scrolling up')
        offset += 50;
        document.querySelector('.edit-songlist').style.transform = `translateY(${offset}px)`;
        cursorTouchingEdge(e)
      }, 40)
    } else if (e.clientY > document.querySelector('.page-wrap').offsetHeight) {
      timer = setTimeout(() => {
        console.log('scrolling down')
        offset -= 50;
        document.querySelector('.edit-songlist').style.transform = `translateY(${offset}px)`;
        cursorTouchingEdge(e)
      }, 40)
    } else {
      clearTimeout(timer);
    }
  }
  // uses changed touches for touch based devices
  const cursorTouchingEdgeMobile = (e) => {
    clearTimeout(timer);
    if (e.changedTouches[0].clientY < 150) {
      timer = setTimeout(() => {
        console.log('scrolling up')
        offset += 50;
        document.querySelector('.edit-songlist').style.transform = `translateY(${offset}px)`;
        cursorTouchingEdgeMobile(e)
      }, 40)
    } else if (e.changedTouches[0].clientY > document.querySelector('.page-wrap').offsetHeight) {
      timer = setTimeout(() => {
        console.log('scrolling down')
        offset -= 50;
        document.querySelector('.edit-songlist').style.transform = `translateY(${offset}px)`;
        cursorTouchingEdgeMobile(e)
      }, 40)
    } else {
      clearTimeout(timer);
    }
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

  // Adds event listners for playlist items after the draggables array is filled
  // useCallback provides update when html draggables are rendered
  useEffect(() => {

    if(draggables.length === 0) return
    let nodes = [...document.querySelectorAll(`.edit-draggable:not(.clone)`)]

    // 5th child of the draggable element is the drag and drop button
    draggables.forEach(element => {
      element.children[4].addEventListener('mousedown', dragStart)
      element.children[4].addEventListener('touchstart', dragStart)
    })

    function dragStart(e) {
      let element = e.target.parentElement
      let startIndex = Number(element.dataset.index)
      console.log(startIndex)
      // create a copy of the dragging element for effect
      let clone = element.cloneNode(true)
      document.getElementById('root').appendChild(clone)
      clone.classList.add('clone')
      if (e.type === 'touchstart') {
        clone.style.setProperty('--x', '-50%')
        clone.style.setProperty('--y', e.changedTouches[0].clientY + 'px')
        clone.style.left = `50%`
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
      document.addEventListener('touchmove', touchMove)
      function mouseMove(e) {
        // scroll up or down if draggable element touches top or bottom of scroll area
        if (e.clientY < 150 || e.clientY > document.querySelector('.page-wrap').offsetHeight) {
          cursorTouchingEdge(e)
        } else {
          clearTimeout(timer);
        }
        clone.style.setProperty('--x', e.clientX + 'px')
        clone.style.setProperty('--y', e.clientY + 'px')
        let nearestNode = getNearestNode(e.clientY, nodes)
        // prevents constant rendering of element, only inserts when element is different
        if (nearestNode !== element && nearestNode !== element.nextSibling) {
          container.current.insertBefore(element, nearestNode)
        }
      }

      function touchMove(e) {
        // scroll up or down if draggable element touches top or bottom of scroll area
        if (e.changedTouches[0].clientY < 150 || e.changedTouches[0].clientY > document.querySelector('.page-wrap').offsetHeight - 100 ) {
          cursorTouchingEdgeMobile(e)
        } else {
          clearTimeout(timer);
        }
        clone.style.setProperty('--y', e.changedTouches[0].clientY + 'px')
        let nearestNode = getNearestNode(e.changedTouches[0].clientY, nodes)
        // prevents constant rendering of element, only inserts when element is different
        if (nearestNode !== element && nearestNode !== element.nextSibling) {
          container.current.insertBefore(element, nearestNode)
        }
      }

      document.addEventListener('mouseup', placeEl)
      document.addEventListener('touchend', placeEl)
      function placeEl() {
        // remove listeners, place element, remove clone, reset timer function
        offset = 0
        clearTimeout(timer)
        document.querySelector('.edit-songlist').style.transform = `translateY(0px)`
        element.style.opacity = '1'
        document.querySelector('.clone')?.remove()
        document.removeEventListener('mousemove', mouseMove)
        document.removeEventListener('mouseup', placeEl)
        document.removeEventListener('touchmove', touchMove)
        document.removeEventListener('touchend', placeEl)
        // get new index of moved element
        let newIndex = Array.from(container.current.childNodes).indexOf(element)
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
            <p>{playlistData?.public === false ? 'Private playlist' : 'Public playlist'}</p>
          </span>
        </div>
      {
        playlistData ?
        <>
          <EditPlaylistDetails 
            playlistData={playlistData} 
            setPlaylistName={setPlaylistName}
            playlistName={playlistName}
            setPlaylistDesc={setPlaylistDesc}
            playlistDesc={playlistDesc}
            setOriginalDesc={setOriginalDesc}
            originalDesc={originalDesc}
            setOriginalName={setOriginalName}
            originalName={originalName}
          />

          <h2 style={{textAlign: 'center', marginBottom: '2rem'}}>Edit tracks:</h2>

          <div className="edit-songlist" ref={container}>
            {contextID === playlistData.id?
              songs.length === 0 ? 
              <BlankSongResult />
              :
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
              tracks.length === 0 ? 
              <BlankSongResult />
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
        <EditSearchResults 
          playlistData={playlistData} 
          id={id} 
          setTracks={setTracks} 
          originalName={originalName}
          playlistName={playlistName}
        />
      </div>
    </div>
  )
}