import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function GetUserRecommendations() {

  let token = window.localStorage.getItem('token')
  const API_URL = `https://api.spotify.com/v1/browse/featured-playlists`

  const [results, setResults] = useState([])
  const trackElement = useRef([])

  const getRecommendations = async () => {
    try {
      const {data} = await axios.get(API_URL, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })
      console.log(data.playlists.items)
      return setResults(data.playlists.items)
    } catch (error) {
      console.error(error)
    }
  }
 
  useEffect(() => {
    if (token) {
      console.log('test')
      getRecommendations()
    }
    return () => {
      console.log('cleanup')
      setResults([])
    }
  },[token])

  return (
    <div className="searchResults">
      {
        results.length != 0 ?
        results.map((result, i) => {
          return (
            <div key={i} ref={trackElement[i]} className={'explore-result'}>
              <img src={result.images[0].url} width={'200px'} height={'200px'} />
              <h2>{result.name}</h2>
              <p>{result.description}</p>
              <button className="play">Play</button>
            </div>
          )
        })
        : <></>
      }
    </div>
  )

}