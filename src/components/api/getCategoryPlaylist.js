import { useState, useRef } from "react";
import axios from "axios";

export default function GetCategoryPlaylist() {

  //TODO: find category ID to pass
  const CATEGORY_ID = ''
  const token = window.localStorage.getItem('token')
  const API_URL = `https://api.spotify.com/v1/browse/categories/${CATEGORY_ID}/playlists`

  const [results, setResults] = useState([])
  const trackElement = useRef([])

  const getCategory = async () => {
    try {
      const {data} = await axios.get(API_URL, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })
      console.log(data)
      return setResults(data.albums)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="searchResults">
      {
        results.length != 0 ?
        results.map((result, i) => {
          return (
            <div key={i} ref={trackElement[i]} className={'search-result'}>
              <h2>{}</h2>
            </div>
          )
        })
        : <></>
      }
    </div>
  )

}