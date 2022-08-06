import { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import { LoginStatusCtx } from "../login";

export default function SearchSongs() {
  
  // global context
  const { token } = useContext(LoginStatusCtx)
  const { playerURIS, setPlayerURIS } = useContext(LoginStatusCtx)
  const { playlistID, setPlaylistID } = useContext(LoginStatusCtx)

  const [tracks, setTracks] = useState([])
  const [search, setSearch] = useState('')
  const [playlists, setPlaylists] = useState([])
  const trackElement = useRef([])
  const searchElement = useRef('')
  const inputElement = useRef('')

  useEffect(() => {
    // get playlists for add to playlist functionality
    const getPlaylists = async () => {
      await axios.get('https://api.spotify.com/v1/me/playlists', {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }).then((res) => {
        setPlaylists(res.data.items)
      }).catch(error => console.error(error))
    }
    getPlaylists()
  },[token])

  function addTrackToPlaylist(resultURI, playlistid) {
    axios({ 
      method: 'post', 
      url: `https://api.spotify.com/v1/playlists/${playlistid}/tracks`, 
      headers: { 'Authorization': 'Bearer ' + token }, 
      data: {
        "uris": [`${resultURI}`]
      }
    })
    document.querySelector('.show-p').classList.remove('show-p')
    setTracks([])
    inputElement.current.value = ''
  }

  function showHideAddToPlaylist(e) {
    if(!e.classList.contains('add-to-playlist')) return
    // if add to playlist button is clicked but a different buttons hidden
    // element is showing, hide it
    if(e.classList.contains('add-to-playlist') && document.querySelector('.show-p') && !e.querySelector('.show-p')) {
      document.querySelector('.show-p').classList.remove('show-p')
    }
    // if hidden element is shown, hide it
    if(e.querySelector('.show-p')) {
      e.querySelector('.show-p').classList.remove('show-p')
    //if hidden element is hidden, show it
    } else {
      e.querySelector('.choose-playlist').classList.add('show-p')
    }
  }

  function playSong(song) {
    console.log(song)
    // save new URIS data to global context (playlist or track)
    setPlayerURIS(song.uri)
    // remove playlist ID as track is playing not playlist
    setPlaylistID('')
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
    if(trackElement.current.length !== 0) {
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
    if(search === '') return
    // set delay for search requests
    const delaySearch = setTimeout(() => {
      const searchSongs = async () => {
        await axios.get('https://api.spotify.com/v1/search', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          params: {
            q: search,
            type: 'track'
          }
        }).then((res) => {
          setTracks(res.data.tracks.items)
        }).catch(error => console.error(error))
      }
      searchSongs()
    }, 300)
    // remove timeout function
    return () => {
      clearTimeout(delaySearch)
    }
  },[search, token])

  return (
    <>
      <div className="search-bar">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="search-btn" fill="currentcolor" width="20px"><path d="M500.3 443.7l-119.7-119.7c27.22-40.41 40.65-90.9 33.46-144.7C401.8 87.79 326.8 13.32 235.2 1.723C99.01-15.51-15.51 99.01 1.724 235.2c11.6 91.64 86.08 166.7 177.6 178.9c53.8 7.189 104.3-6.236 144.7-33.46l119.7 119.7c15.62 15.62 40.95 15.62 56.57 0C515.9 484.7 515.9 459.3 500.3 443.7zM79.1 208c0-70.58 57.42-128 128-128s128 57.42 128 128c0 70.58-57.42 128-128 128S79.1 278.6 79.1 208z"/></svg>
        <input ref={inputElement} type='search' onChange={(e) => setSearch(e.target.value)} className="search" placeholder="search songs..." />
        <div ref={searchElement} className={tracks.length === 0 ? 'search-results-wrap' : 'search-results-wrap show-search'}>
        {
          tracks.length !== 0 ?
          tracks.map((result, i) => {
            return (
            <div key={i} ref={trackElement[i]} className={'search-result'}>
              <img src={result.album.images[0].url} alt={result.name + 'album art'} height={'90px'} />
              <span>
              <h3>{result.name}</h3>
                {result.artists.map(artist => {
                  return `${artist.name}, `
                })}
              </span>
              <button className="add-to-playlist" onClick={(e) => showHideAddToPlaylist(e.target)}>
                <svg style={{pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg" fill="currentcolor" width="20px" viewBox="0 0 512 512">{/* Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. */}<path d="M0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84.02L256 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 .0003 232.4 .0003 190.9L0 190.9z"/></svg>
                <span className={"choose-playlist"}>
                  <h3>Add to playlist:</h3>
                  <ul>
                    {
                      playlists? playlists.map((playlist, index) => {
                        return <li key={index} style={{listStyle:"none"}} onClick={() => addTrackToPlaylist(result.uri, playlist.id)}>{playlist.name}</li>
                      })
                      : <li>No playlists found</li>
                    }
                  </ul>
                </span>
              </button>
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