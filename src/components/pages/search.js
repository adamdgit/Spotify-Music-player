import axios from "axios";
import { useState, useRef, useEffect, useContext } from "react";
import { GlobalContext } from "../login";
import { showHideAddToPlaylistBtn } from "../utils/showHideAddToPlaylistBtn"
import { addTrackToPlaylist } from "../api/addTrackToPlaylist";
import { sanitizeArtistNames } from "../utils/sanitizeArtistNames";
import { getUserPlaylists } from "../api/getUserPlaylists"
import { searchSongs } from "../api/search";

export default function SearchSongs() {
  
  // global context
  const { token } = useContext(GlobalContext)
  const { setSongs } = useContext(GlobalContext)
  const { setContextURI } = useContext(GlobalContext)
  const { playlistID, setPlaylistID } = useContext(GlobalContext)
  const { setMessage } = useContext(GlobalContext)
  const { setPlayerCBData } = useContext(GlobalContext)

  const [searchResults, setSearchResults] = useState([])
  const [query, setQuery] = useState('')
  const [playlists, setPlaylists] = useState([])
  const searchElement = useRef()
  const inputElement = useRef()

  useEffect(() => {
    getUserPlaylists(token)
    .then(result => {
      if(result.length > 0) return setPlaylists(result)
      console.error(result)
    })
  },[token])

  const addToPlaylist = async (resultURI, playlistid, playlistName) => {
    addTrackToPlaylist(resultURI, playlistid, token)
    .then(result => {
      if(result.length > 0) {
        // Only update currently playing song data if
        // playlist IDs match, as we need to sync the newly
        // added song to the current playlist
        if (playlistID === playlistid) {
          return setSongs(result)
        }
        return
      }
      console.error(result)
    })
    setMessage(`Song added to playlist: ${playlistName}`)
    document.querySelector('.show-p').classList.remove('show-p')
  }

  const playSong = async (song)  => {
    // TODO: export to api folder
    // fix callback update so playlist info updates correctly
    // currently type is being read as track_play_pause instead of track_update
    console.log(song)
    await axios({ 
      method: 'put', 
      url: 'https://api.spotify.com/v1/me/player/play', 
      headers: { 'Authorization': 'Bearer ' + token }, 
      data: {
        "uris": [song.uri],
        "offset": { "position": 0 }
      }
    }).catch(error => {return console.error(error)})
    // save new URIS data to global context (playlist or track)
    setContextURI(song.uri)
    setPlayerCBData(current => ({...current, type: 'track_update'}))
    setPlayerCBData(current => ({...current, track_id: song.id}))
    // remove playlist ID as track is playing not playlist
    setPlaylistID('')
  }

  useEffect(() => {
    if(query === '') return
    // set delay for search requests
    const delaySearch = setTimeout(() => {
      const search = async () => {
        searchSongs(token, query)
          .then(result => {
            if(result.length !== 0) return setSearchResults(result.tracks.items)
            return console.error(result)
          })
      }
      search()
    }, 300)
    // remove timeout function
    return () => {
      clearTimeout(delaySearch)
    }
  },[query, token])

  return (
    <div className="page-wrap" style={{backgroundColor: 'var(--bg-blue)'}}>
      <div className="main-content" style={{backgroundColor: 'var(--primary-blue)'}}>

        <h1>Search songs:</h1>
        <div className="search-bar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="search-btn" fill="currentcolor" width="20px"><path d="M500.3 443.7l-119.7-119.7c27.22-40.41 40.65-90.9 33.46-144.7C401.8 87.79 326.8 13.32 235.2 1.723C99.01-15.51-15.51 99.01 1.724 235.2c11.6 91.64 86.08 166.7 177.6 178.9c53.8 7.189 104.3-6.236 144.7-33.46l119.7 119.7c15.62 15.62 40.95 15.62 56.57 0C515.9 484.7 515.9 459.3 500.3 443.7zM79.1 208c0-70.58 57.42-128 128-128s128 57.42 128 128c0 70.58-57.42 128-128 128S79.1 278.6 79.1 208z"/></svg>
          <input ref={inputElement} type='search' 
            onChange={(e) => setQuery(e.target.value)}
            className="search" 
            placeholder="search songs..." 
          />
        </div>

        <div ref={searchElement} className={searchResults.length === 0 ? 'search-results-wrap' : 'search-results-wrap show-search'}>
          {
            searchResults.length !== 0 ?
            searchResults.map((result, i) => {
              if (result === null || result === undefined) return
              return (
              <div key={i} className={'search-result'}>
                <img src={
                  result.album.images.length === 0 ?
                  'no image found' :
                  result.album.images.length === 3 ?
                  result.album.images[2].url :
                  result.album.images[0].url
                  } alt={
                    result.album.images.length === 0 ?
                  'no image found' :
                  `${result.name} album art`
                  }/>
                <span>
                <h3>{result.name}</h3>
                <p>{sanitizeArtistNames(result.artists)}</p>
                </span>
                <button className="add-to-playlist" onClick={(e) => showHideAddToPlaylistBtn(e.target)}>
                  <svg style={{pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg" fill="currentcolor" width="20px" viewBox="0 0 512 512">{/* Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. */}<path d="M0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84.02L256 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 .0003 232.4 .0003 190.9L0 190.9z"/></svg>
                  <span className={"choose-playlist"}>
                    <h3>Add to playlist:</h3>
                    <ul>
                      {
                        playlists? playlists.map((playlist, index) => {
                          return <li key={index} style={{listStyle:"none"}} onClick={() => addToPlaylist(result.uri, playlist.id, playlist.name)}>{playlist.name}</li>
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
    </div>
  )

}