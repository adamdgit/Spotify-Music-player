import { useState, useEffect, useContext } from "react";
import { GlobalContext } from "../login";
import { getUserPlaylists } from "../../api/getUserPlaylists"
import { searchSongs } from "../../api/search";
import SearchResult from "../SearchResult";

export default function SearchSongs() {
  
  // global context
  const { token } = useContext(GlobalContext)
  const { userID } = useContext(GlobalContext)

  const [query, setQuery] = useState('')
  const [playlists, setPlaylists] = useState([])
  // tracks, albums, playlist results
  const [tracksResults, setTracksResults] = useState([])
  const [playlistResults, setPlaylistResults] = useState([])
  const [albumResults, setAlbumsResults] = useState([])

  useEffect(() => {

    if(!userID) return

    getUserPlaylists(token)
      .then(result => {
        if (result.errorMsg === false) return setPlaylists(result.playlists.filter(a => {
          if(a.owner.id === userID) return a
          return null
        }))
        else console.error(result.errorMsg)
      })
    
  },[token, userID])

  useEffect(() => {
    if(query === '') return
    // set delay for search requests
    const delaySearch = setTimeout(() => {
      const search = async () => {
        searchSongs(token, query)
          .then(result => {
            console.log(result)
            if(result.errorMsg === false) {
              setTracksResults(result.searchResult.tracks.items)
              setAlbumsResults(result.searchResult.albums.items)
              setPlaylistResults(result.searchResult.playlists.items)
            }
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

  return (
    <div className="page-wrap">
      <div className="main-content">

        <h1>Search:</h1>
        <div className="search-bar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="search-btn" fill="currentcolor" width="20px"><path d="M500.3 443.7l-119.7-119.7c27.22-40.41 40.65-90.9 33.46-144.7C401.8 87.79 326.8 13.32 235.2 1.723C99.01-15.51-15.51 99.01 1.724 235.2c11.6 91.64 86.08 166.7 177.6 178.9c53.8 7.189 104.3-6.236 144.7-33.46l119.7 119.7c15.62 15.62 40.95 15.62 56.57 0C515.9 484.7 515.9 459.3 500.3 443.7zM79.1 208c0-70.58 57.42-128 128-128s128 57.42 128 128c0 70.58-57.42 128-128 128S79.1 278.6 79.1 208z"/></svg>
          <input 
            type='search' 
            onChange={(e) => setQuery(e.target.value)}
            className="search" 
            placeholder="search songs..." 
          />
        </div>

        <SearchResult 
          heading={'Tracks'}
          array={tracksResults}
          playlists={playlists}
        />

        <SearchResult 
          heading={'Albums'}
          array={albumResults}
          playlists={playlists}
        />

        <SearchResult 
          heading={'Playlists'}
          array={playlistResults}
          playlists={playlists}
        />

      </div>
    </div>
  )

}