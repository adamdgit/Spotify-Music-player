import { useState, useRef, useEffect } from "react"

export default function AddToPlaylistBtn({track, userID, userPlaylists, addToPlaylist}) {

  const [modalIsHidden, setModalIsHidden] = useState(true)
  const [filteredPlaylists, setFilteredPlaylists] = useState([])
  const addToPlaylistBtn = useRef()

  function preventModalOverflow(e) {
    // prevent check for small devices
    if (window.innerWidth < 900) return
    // only run modal checks when button is clicked, not children of button
    if (e.target !== addToPlaylistBtn.current) return
    // modal is 2nd child of button clicked
    let modal = e.target.childNodes[1]
    if(modal.getBoundingClientRect().top < 120) {
      modal.style.top = "35px"
    }
    // prevent modal displaying outside of screen
    // 125px is height of controls panel
    if(modal.getBoundingClientRect().bottom > (document.querySelector('.page-wrap').offsetHeight)) {
      modal.style.top = `-${modal.clientHeight}px`
    }

    if(modal.getBoundingClientRect().left < 5) {
      modal.style.left = '0px'
      modal.style.right = 'unset'
    }
  }

  useEffect(() => {
    setFilteredPlaylists(userPlaylists.filter(a => {
      if(a.owner.id === userID) return a
      else return null
    }))
  }, [userPlaylists])

  return (
    <button ref={addToPlaylistBtn} 
      className="add-to-playlist" 
      onBlur={() => setModalIsHidden(true)}
      onClick={(e) => {
        setModalIsHidden(!modalIsHidden)
        preventModalOverflow(e)
      }
    }>
      <svg style={{pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg" fill="currentcolor" width="20px" viewBox="0 0 512 512"><path d="M0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84.02L256 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 .0003 232.4 .0003 190.9L0 190.9z"/></svg>
      <span className={modalIsHidden === true ? "choose-playlist" : "choose-playlist showModal"}>
        <h3>{track.name}</h3>
        <h4>Add to playlist:</h4>
        <span role="button" className="close-playlist-btn" onClick={() => setModalIsHidden(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="20px" viewBox="0 0 320 512"><path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/></svg>
        </span>
        <ul>
        {
          filteredPlaylists? filteredPlaylists.map((playlist, index) => {
            return <li key={index} style={{listStyle:"none"}} onClick={() => addToPlaylist(track.uri, playlist.id, playlist.name)}>{playlist.name}</li>
          })
          : <li>No playlists found</li>
        }
        </ul>
      </span>
    </button>
  )
}