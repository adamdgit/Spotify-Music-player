import { useState, useRef, useContext, useEffect } from "react";
import axios from "axios";
import { LoginStatusCtx } from "../login";

export default function GetFeatured() {

  const { token } = useContext(LoginStatusCtx)
  const { playerURIS, setPlayerURIS } = useContext(LoginStatusCtx)
  const { playerOffset, setPlayerOffset } = useContext(LoginStatusCtx)
  const { playlistID, setPlaylistID } = useContext(LoginStatusCtx)

  const [results, setResults] = useState([])
  const trackElement = useRef([])

  function playPlaylist(playlist){
    // save currently playing playlist data to global context
    setPlayerURIS(playlist.uri)
    setPlaylistID(playlist.id)
    setPlayerOffset(0)
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
        console.log(res.data)
        setResults(res.data.playlists.items)
      }).catch(error => console.error(error))
    }
    getFeaturedPlaylists()
  },[token])

  return (
    <div className="searchResults">
      {
        results.length !== 0 ?
        results.map((result, i) => {
          return (
            <div key={i} ref={trackElement[i]} className={'explore-result'}>
              <img src={result.images[0].url} alt={result.name + 'playlist art'} width={'200px'} height={'200px'} />
              <h2>{result.name}</h2>
              <p>{result.description}</p>
              <button className="play" onClick={() => playPlaylist(result)}>
                <svg viewBox="0 0 16 16" height="25" width="25" fill="currentcolor"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>
              </button>
            </div>
          )
        })
        : <></>
      }
    </div>
  )

}