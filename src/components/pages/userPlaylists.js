import GetUserPlaylists from "../api/getUserPlaylists"
import { createPlaylist } from "../api/createPlaylist"

export default function UserPlaylists({...props}) {

  return (
    <div className="page-wrap">
      <div className="main-content">
        <div className="create-playlists-wrap">
          <h1>My Playlists</h1>
          <button className="play" onClick={() => createPlaylist(props.token, props.userID)}>Create Playlist</button>
        </div>
        <GetUserPlaylists />
      </div>
    </div>
  )
}