import GetUserRecommendations from './api/getRecommendations'

export default function Explore() {

  return (
    <div className="page-wrap">
      <div className="main-content">
        <h1 style={{margin:'10px 0 40px 0'}}>Explore new music</h1>
        <h2 className="featured">Spotify featured playlists:</h2>
        <div className="featured-category">
            <h3>Art</h3>
            <h3>Playlist Name</h3>
            <h3>Description</h3>
          </div>
          <GetUserRecommendations />
      </div>
    </div>
  )
}