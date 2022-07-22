import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function SearchSongs({...props}) {

  const API_URL = 'https://api.spotify.com/v1/search'

  const [tracks, setTracks] = useState([])
  const [search, setSearch] = useState('')
  const trackElement = useRef([])
  const searchElement = useRef('')

  useEffect(() => {

    function handleClick(e) {
      if (searchElement.current && !searchElement.current.contains(e.target)) {
        setTracks([])
        searchElement.current.value = ''
      }
    }
    // listen for click outside of search input to hide results
    document.addEventListener('mousedown', handleClick)

    // clear html search results 
    if(trackElement.current.length != 0) {
      trackElement.current.forEach(element => {
        element.remove()
      })
    }
    // set delay for search requests
    const delaySearch = setTimeout(() => {
      searchtest()
      async function searchtest() {
      try {
        const {data} = await axios.get(API_URL, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${props.token}`,
            'Content-Type': 'application/json',
          },
          params: {
            q: search,
            type: 'track'
          }
        })
          console.log(data.tracks.items)
          return setTracks(data.tracks.items)
        } catch (error) {
          console.error(error)
          return setTracks([])
        }
      }
    }, 300)

    // cleanup event listener and remove timer
    return () => {
      clearTimeout(delaySearch)
      document.removeEventListener('mousedown', handleClick)
    }
  },[search])

  return (
    <div className="searchWrap">
      <div className="search-bar">
        <input type='search' ref={searchElement} onChange={(e) => setSearch(e.target.value)} className="search" placeholder="search" />
      </div>
      <div className={tracks.length == 0 ? 'search-results-wrap' : 'search-results-wrap show-search'}>
      {
        tracks.length != 0 ?
        tracks.map((result, i) => {
          return (
          <div key={i} ref={trackElement[i]} className={'search-result'}>
            <img src={result.album.images[0].url} height={'90px'} />
            <span>
            <h3>{result.name}</h3>
              {result.artists.map(artist => {
                return `${artist.name}, `
              })}
            </span>
          </div>
          )
        })
        : <></>
      }
      </div>
    </div>
  )

}