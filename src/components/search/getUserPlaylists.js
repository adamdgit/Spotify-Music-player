import { useState, useRef } from "react";
import axios from "axios";

export default function GetUserPlaylists({...props}) {

  const API_URL = `https://api.spotify.com/v1/me/playlists`

  const [results, setResults] = useState([])
  const trackElement = useRef([])
 
  const getPlaylists = async () => {
    try {
      const {data} = await axios.get(API_URL, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${props.token}`,
          'Content-Type': 'application/json',
        }
      })
      console.log(data.items)      
      return setResults(data.items)
    } catch (error) {
      console.error(error)
      return setResults([])
    }
  }

  async function playPlaylist(id) {
    try {
      await axios.put(`https://api.spotify.com/v1/me/player/play`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${props.token}`,
          'Content-Type': 'application/json',
        },
        data: {
          'context-uri': `spotify:playlist:${id}`,
        },
        "position_ms" : 0
      })   
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="searchResults">
        <button onClick={getPlaylists}>Get my playlists</button>
      <h1>My Playlists:</h1>
      {
        results.length != 0 ?
        results.map((result, i) => {
          return (
          <div key={i} ref={trackElement[i]} className={'search-result'}>
            <img src={result.images[0].url} width={'200px'} height={'200px'} />
            <h1>{result.name}</h1>
            <h2>{result.description}</h2>
            <button onClick={() => playPlaylist(result.id)}>Play</button>
          </div>
          )
        })
        : <></>
      }
    </div>
  )

}