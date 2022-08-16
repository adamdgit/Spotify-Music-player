import { useContext, useState } from "react"
import { LoginStatusCtx } from "../login";


export default function Playlist() {

  const { token } = useContext(LoginStatusCtx)

  const [playlistName, setPlaylistName] = useState('')
  const [playlistDesc, setPlaylistDesc] = useState('')

  function changeName(e) {
    setPlaylistName(e.target.value)
  }

  function changeDescription(e) {
    setPlaylistDesc(e.target.value)
  }

  return (
    <div className="page-wrap" style={{backgroundColor: 'var(--bg-blue)'}}>
      <div className="main-content" style={{backgroundColor: 'var(--primary-blue)'}}>

        <h1>Create new playlist:</h1>

        <div className="create-playlist">
        <svg xmlns="http://www.w3.org/2000/svg" width={100} height={100} fill="currentcolor" viewBox="0 0 512 512"><path d="M447.1 32h-384C28.64 32-.0091 60.65-.0091 96v320c0 35.35 28.65 64 63.1 64h384c35.35 0 64-28.65 64-64V96C511.1 60.65 483.3 32 447.1 32zM111.1 96c26.51 0 48 21.49 48 48S138.5 192 111.1 192s-48-21.49-48-48S85.48 96 111.1 96zM446.1 407.6C443.3 412.8 437.9 416 432 416H82.01c-6.021 0-11.53-3.379-14.26-8.75c-2.73-5.367-2.215-11.81 1.334-16.68l70-96C142.1 290.4 146.9 288 152 288s9.916 2.441 12.93 6.574l32.46 44.51l93.3-139.1C293.7 194.7 298.7 192 304 192s10.35 2.672 13.31 7.125l128 192C448.6 396 448.9 402.3 446.1 407.6z"/></svg>
          <span>
            <span style={{display:'flex'}}>
              <h3>Name:</h3>
              <h2>{playlistName}</h2>
            </span>
            <input type="text" className="edit-input" 
              onChange={changeName}
              placeholder="Enter a playlist name"
            />
            <span style={{display:'flex'}}>
              <h3>Description:</h3>
              <h3>{playlistDesc}</h3>
            </span>
            <input type="text" className="edit-input" 
              onChange={changeDescription}
              placeholder="Enter a playlist description"
            />
            <span style={{display:'flex'}}>
              <h3>Make Public?</h3>            
              <input type="checkbox" />
              <p>(Leave unchecked for private playlist)</p>
            </span>
          </span>
        </div>

      </div>

      <div className="search-songs-wrap">
        <h2>Find songs to add to your playlist:</h2>
        <div className="search-bar" style={{maxWidth: '500px'}}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="search-btn" fill="currentcolor" width="20px"><path d="M500.3 443.7l-119.7-119.7c27.22-40.41 40.65-90.9 33.46-144.7C401.8 87.79 326.8 13.32 235.2 1.723C99.01-15.51-15.51 99.01 1.724 235.2c11.6 91.64 86.08 166.7 177.6 178.9c53.8 7.189 104.3-6.236 144.7-33.46l119.7 119.7c15.62 15.62 40.95 15.62 56.57 0C515.9 484.7 515.9 459.3 500.3 443.7zM79.1 208c0-70.58 57.42-128 128-128s128 57.42 128 128c0 70.58-57.42 128-128 128S79.1 278.6 79.1 208z"></path></svg>
          <input type="search" placeholder="Search..." className="search" />
        </div>
       </div>

    </div>
  )
}