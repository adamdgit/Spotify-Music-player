import GetFeatured from '../api/getFeatured'

export default function Explore() {

  return (
    <div className="page-wrap">
      <div className="main-content">
        <h1 className="featured">Spotify featured playlists:</h1>
          <GetFeatured />
      </div>
    </div>
  )
}