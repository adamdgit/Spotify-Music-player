import GetUserPlaylists from "../api/getUserPlaylists"

export default function Playlists() {

  return (
    <div className="page-wrap">
      <div className="main-content">
        <h1 className="featured">My Playlists</h1>
        <GetUserPlaylists />
      </div>
    </div>
  )
}