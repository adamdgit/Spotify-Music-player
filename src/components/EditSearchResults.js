import { useState, useEffect, useContext } from "react";
import { GlobalContext } from "../components/login";
import { sanitizeArtistNames } from "./utils/sanitizeArtistNames"
import { addTrackToPlaylist } from "../api/addTrackToPlaylist"
import { searchSongs } from "../api/search";
import { playTrack } from "../api/playTrack";

export default function EditSearchResults({ playlistData, id, setTracks, playlistName, originalName }) {

  // global context
  const { token } = useContext(GlobalContext)
  const { setSongs } = useContext(GlobalContext)
  const { contextID, setContextID } = useContext(GlobalContext)
  const { setContextURI } = useContext(GlobalContext)
  const { setMessage } = useContext(GlobalContext)
  // local state
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    if(query === '') return
    // set delay for search requests
    const delaySearch = setTimeout(() => {
      const search = async () => {
        searchSongs(token, query)
          .then(result => {
            if(result.errorMsg === false) return setResults(result.searchResult)
            else console.error(result.errorMsg)
          })
      }
      search()
    }, 300)
    // remove timeout function
    return () => {
      clearTimeout(delaySearch)
    }
  },[query, token])

  const playItem = async (uri)  => {
    // tracks have different endpoint
    setSongs([])
    // remove contextID for tracks only
    setContextID('')
    // save new URIS data to global context (playlist or track)
    setContextURI(uri)
    playTrack(token, uri)
    .then(result => {
      if (!result) return
      console.error(result)
    })
  }

  const addTrack = (uri) => {
    addTrackToPlaylist(uri, id, token)
    .then(result => {
      if (result.errorMsg === false) {
        if (contextID === playlistData.id) {
          return setSongs(result.tracks)
        }
        return setTracks(result.tracks)
      }
      else console.error(result.errorMsg)
    })
    setMessage({msg: 'Track added to playlist', needsUpdate: true})
  }

  return (
    <div className="search-songs-wrap">
      <h2>Find songs to add to playlist: {!playlistName ? originalName : playlistName}</h2>
      <div className="search-bar" style={{maxWidth: '500px'}}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="search-btn" fill="currentcolor" width="20px"><path d="M500.3 443.7l-119.7-119.7c27.22-40.41 40.65-90.9 33.46-144.7C401.8 87.79 326.8 13.32 235.2 1.723C99.01-15.51-15.51 99.01 1.724 235.2c11.6 91.64 86.08 166.7 177.6 178.9c53.8 7.189 104.3-6.236 144.7-33.46l119.7 119.7c15.62 15.62 40.95 15.62 56.57 0C515.9 484.7 515.9 459.3 500.3 443.7zM79.1 208c0-70.58 57.42-128 128-128s128 57.42 128 128c0 70.58-57.42 128-128 128S79.1 278.6 79.1 208z"></path></svg>
        <input type="search" placeholder="Search..." 
          className="search" 
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="search-results-wrap show-search">
        { results.length !== 0 ? results.tracks.items.map((track, index) => {
        return (
          <div className="result-small" key={index}>
            <img src={
              track.album.images.length === 0 ?
              'no image found' :
              track.album.images.length === 3 ?
              track.album.images[2].url :
              track.album.images[0].url
              } alt={
              track.album.images.length === 0 ?
              'no image found' :
              `${track.name} album art`
              }/>
            <span>
              <h3>{track.name}</h3>
              <p>{sanitizeArtistNames(track.artists)}</p>
            </span>
            <button className="play" onClick={() => addTrack(track.uri)} >Add</button>
            <button className="play" onClick={() => playItem(track.uri)}>
              <svg viewBox="0 0 16 16" height="25" width="25" fill="currentcolor"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>
            </button>
          </div>)
        })
        : <></>
        }
      </div>
    </div>
  )
}