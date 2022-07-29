import { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import { LoginStatusCtx } from "../login";

export default function SearchSongs() {

  const { token, setToken } = useContext(LoginStatusCtx)
  const { playlistData, setPlaylistData } = useContext(LoginStatusCtx)

  const [tracks, setTracks] = useState([])
  const [search, setSearch] = useState('')
  const trackElement = useRef([])
  const searchElement = useRef('')
  const inputElement = useRef('')

  function playSong(song) {
    console.log(song)
    // save currently playing playlist data to global context
    setPlaylistData({
      uris: song.uri,
      play: true,
      autoplay: true,
      offset: 0
    })
  }

  useEffect(() => {

    function handleClick(e) {
      if (searchElement.current 
        && !searchElement.current.contains(e.target) 
        && !inputElement.current.contains(e.target)) 
      {
        setTracks([])
        inputElement.current.value = ''
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

    // cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }

  },[])

  useEffect(() => {
    // set delay for search requests
    const delaySearch = setTimeout(() => {
      searchSongs()
      async function searchSongs() {
      try {
        const {data} = await axios.get('https://api.spotify.com/v1/search', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
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

    // remove timeout function
    return () => {
      clearTimeout(delaySearch)
    }

  },[search])

  return (
    <>
      <div className="search-bar">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="search-btn" fill="currentcolor" width="20px"><path d="M500.3 443.7l-119.7-119.7c27.22-40.41 40.65-90.9 33.46-144.7C401.8 87.79 326.8 13.32 235.2 1.723C99.01-15.51-15.51 99.01 1.724 235.2c11.6 91.64 86.08 166.7 177.6 178.9c53.8 7.189 104.3-6.236 144.7-33.46l119.7 119.7c15.62 15.62 40.95 15.62 56.57 0C515.9 484.7 515.9 459.3 500.3 443.7zM79.1 208c0-70.58 57.42-128 128-128s128 57.42 128 128c0 70.58-57.42 128-128 128S79.1 278.6 79.1 208z"/></svg>
        <input ref={inputElement} type='search' onChange={(e) => setSearch(e.target.value)} className="search" placeholder="search songs..." />
        <div ref={searchElement} className={tracks.length == 0 ? 'search-results-wrap' : 'search-results-wrap show-search'}>
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
              <button className="play" onClick={() => playSong(result)}>
                <svg viewBox="0 0 16 16" height="25" width="25" fill="currentcolor"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>
              </button>
            </div>
            )
          })
          : <></>
        }
        </div>
      </div>
    </>
  )

}