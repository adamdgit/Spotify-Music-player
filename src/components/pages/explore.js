import { useState, useRef, useContext, useEffect } from "react";
import { GlobalContext } from "../login";
import { changePlaylistSong } from "../api/changePlaylistSong";
import axios from "axios";
import Loading from "../Loading";

export default function Explore() {

  const { token } = useContext(GlobalContext)
  const { setContextURI } = useContext(GlobalContext)
  const { setPlaylistID } = useContext(GlobalContext)
  const { setPlayerCBData } = useContext(GlobalContext)

  const [results, setResults] = useState([])
  const trackElement = useRef([])

  function playPlaylist(playlist){
    // save currently playing playlist data to global context
    setContextURI(playlist.uri)
    setPlaylistID(playlist.id)
    changePlaylistSong(0, token, playlist.uri)
    setPlayerCBData(current => ({...current, type: 'track_update'}))
  }
 
  useEffect(() => {
    const getFeaturedPlaylists = async () => {
      await axios.get('https://api.spotify.com/v1/browse/featured-playlists', {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }).then((res) => {
        setResults(res.data.playlists.items)
      }).catch(error => console.error(error))
    }
    getFeaturedPlaylists()
  },[token])

  return (
    <div className="page-wrap">
      <div className="main-content">
        <h1 className="featured">Spotify featured playlists:</h1>
        <div className="explore-wrap">
          {
            results? results.map((result, i) => {
              if (result === null || result === undefined) return
              return (
                <div key={i} ref={trackElement[i]} className={'explore-result'}>
                  <img src={
                    result.images.length === 0 ?
                    'no image found' :
                    result.images[0].url
                    } alt={
                    result.images.length === 0 ?
                    'no image found' :
                    `${result.name} playlist art`
                    } width={'200px'} height={'200px'} />
                  <h2>{result.name}</h2>
                  <p>{result.description}</p>
                  <button className="play" onClick={() => playPlaylist(result)}>
                    <svg viewBox="0 0 16 16" height="25" width="25" fill="currentcolor"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>
                  </button>
                </div>
              )
            })
            : results?.length === 0 ? <h1>No data found</h1>
            : <Loading loadingMsg={'Fetching featured playlists...'}/>
          }
        </div>
      </div>
    </div>
  )
}