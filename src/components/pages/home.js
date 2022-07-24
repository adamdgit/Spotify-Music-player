
export default function Home() {

  return (
    <div className="page-wrap">
      <div className="main-content">
        <h1 className="featured">Home</h1>
        <h3>Show random category playlists </h3>
        <p>https://api.spotify.com/v1/browse/categories/$category_id/playlists</p>
      </div>
    </div>
  )
}