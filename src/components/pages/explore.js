import GetUserRecommendations from '../api/getRecommendations'

export default function Explore() {

  return (
    <div className="page-wrap">
      <div className="main-content">
        <h1 className="featured">Spotify featured playlists:</h1>
          <GetUserRecommendations />
      </div>
    </div>
  )
}