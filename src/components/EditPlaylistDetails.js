import { useState, useContext } from "react"
import { useParams } from "react-router-dom"
import { changePlaylistDetails } from "../api/changePlaylistDetails"
import { GlobalContext } from "./login"
import ErrorTooltip from "../components/ErrorTooltip"

export default function EditPlaylistDetails({ setOriginalDesc, originalDesc, setOriginalName, originalName, playlistData, playlistName, playlistDesc, setPlaylistName, setPlaylistDesc }) {

  const { id } = useParams()
  const { token } = useContext(GlobalContext)
  const { setMessage } = useContext(GlobalContext)

  const [error, setError] = useState(false)
  const [isPublic, setIsPublic] = useState(false)

  const changeDetails = (e) => {
    e.preventDefault()
    // simple validation
    if (playlistName === '' && playlistDesc === '') {
      setError(true)
      const timer = setTimeout(() => {
        setError(false)
        clearTimeout(timer)
      }, 4000)
      return
    }
    if (playlistName === '' && playlistDesc !== '') {
      setError(false)
      changePlaylistDetails(token, id, playlistDesc, originalName, isPublic)
        .then(result => {
          if (result === false) {
            setOriginalDesc(playlistDesc)
            setMessage({msg: 'Playlist details updated', needsUpdate: true})
            return
          }
          else console.error(result)
        })
    }
    if (playlistName !== '' && playlistDesc === '') {
      setError(false)
      changePlaylistDetails(token, id, originalDesc, playlistName, isPublic)
        .then(result => {
          if (result === false) {
            setOriginalName(playlistName)
            setMessage({msg: 'Playlist details updated', needsUpdate: true})
            return
          }
          else console.error(result)
        })
    }
    setError(false)
    changePlaylistDetails(token, id, playlistDesc, playlistName, isPublic)
      .then(result => {
        if (result === false) {
          setOriginalDesc(playlistDesc)
          setOriginalName(playlistName)
          setMessage({msg: 'Playlist details updated', needsUpdate: true})
        }
        else console.error(result)
      })
  }

  return (
    <div className="edit-playlist">
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
        <ErrorTooltip tip={'No name or description entered'} error={error}/>
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
  )
}