import GetUserPlaylists from "../api/getUserPlaylists"
import { NavLink } from "react-router-dom"

export default function Playlists() {

  return (
    <div className="page-wrap">
      <div className="main-content">
        <div className="create-playlists-wrap">
          <h1>My Playlists</h1>
          <NavLink to={'/create-playlist'}>
            <button className="play">Create Playlist</button>
          </NavLink>
        </div>
        <GetUserPlaylists />
      </div>
    </div>
  )
}