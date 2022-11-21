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
  // checkbox state for ssearch
  const [searchTracks, setSearchTracks] = useState(false)
  const [searchPlaylists, setSearchPlaylists] = useState(false)
  const [searchAlbums, setSearchAlbums] = useState(false)

  const search = async () => {
    if (searchTracks === false) setTracksResults([])
    if (searchAlbums === false) setAlbumsResults([])
    if (searchPlaylists === false) setPlaylistResults([])
    searchSongs(token, query)
      .then(result => {
        console.log(result)
        if(result.errorMsg === false) {
          if (searchTracks === true) setTracksResults(result.searchResult.tracks.items)
          if (searchAlbums === true) setAlbumsResults(result.searchResult.albums.items)
          if (searchPlaylists === true) setPlaylistResults(result.searchResult.playlists.items)
        }
        else console.error(result.errorMsg)
      })
  }

  const handleCheckboxChange = (e) => {
    console.log(e.target.value)
    // whenever value is checked, refresh search
    if (e.target.checked === true && e.target.value === 'Tracks') {
      setSearchTracks(true)
    } else if (e.target.checked === false && e.target.value === 'Tracks') {
      setSearchTracks(false)
    }
    if (e.target.checked === true && e.target.value === 'Playlists') {
      setSearchPlaylists(true)
    } else if (e.target.checked === false && e.target.value === 'Playlists') {
      setSearchPlaylists(false)
    }
    if (e.target.checked === true && e.target.value === 'Albums') {
      setSearchAlbums(true)
    } else if (e.target.checked === false && e.target.value === 'Albums') {
      setSearchAlbums(false)
    }
  }

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      search()
      clearTimeout(delaySearch)
    }, 300)
  }, [searchTracks, searchAlbums, searchPlaylists])

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

        <h1>Search:</h1><br />
        <div className="search-checkbox">
          <span>
            <label htmlFor="tracks">Tracks: </label>
            <input type="checkbox" name="tracks" value="Tracks" 
            onChange={(e) => handleCheckboxChange(e)} />
          </span>
          <span>
            <label htmlFor="playlists">Playlists: </label>
            <input type="checkbox" name="playlists" value="Playlists" 
            onChange={(e) => handleCheckboxChange(e)} />
          </span>
          <span>
            <label htmlFor="Albums">Albums: </label>
            <input type="checkbox" name="albums" value="Albums" 
            onChange={(e) => handleCheckboxChange(e)} />
          </span>
        </div>
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
          svg={<svg xmlns="http://www.w3.org/2000/svg" width="30px" fill="currentColor" viewBox="0 0 512 512"><path d="M499.1 6.3c8.1 6 12.9 15.6 12.9 25.7v72V368c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6V147L192 223.8V432c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6V200 128c0-14.1 9.3-26.6 22.8-30.7l320-96c9.7-2.9 20.2-1.1 28.3 5z"/></svg>}
          array={tracksResults}
          playlists={playlists}
        />

        <SearchResult 
          heading={'Albums'}
          svg={<svg xmlns="http://www.w3.org/2000/svg" width="30px" fill="currentColor" viewBox="0 0 512 512"><path d="M512 256c0 141.4-114.6 256-256 256S0 397.4 0 256S114.6 0 256 0S512 114.6 512 256zM256 352c-53 0-96-43-96-96s43-96 96-96s96 43 96 96s-43 96-96 96zm0 32c70.7 0 128-57.3 128-128s-57.3-128-128-128s-128 57.3-128 128s57.3 128 128 128zm0-96c17.7 0 32-14.3 32-32s-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32z"/></svg>}
          array={albumResults}
          playlists={playlists}
        />

        <SearchResult 
          heading={'Playlists'}
          svg={<svg xmlns="http://www.w3.org/2000/svg" width="30px" fill="currentColor" viewBox="0 0 576 512"><path d="M0 96C0 60.7 28.7 32 64 32H512c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM128 288c17.7 0 32-14.3 32-32s-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32zm32-128c0-17.7-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32s32-14.3 32-32zM128 384c17.7 0 32-14.3 32-32s-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32zm96-248c-13.3 0-24 10.7-24 24s10.7 24 24 24H448c13.3 0 24-10.7 24-24s-10.7-24-24-24H224zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24H448c13.3 0 24-10.7 24-24s-10.7-24-24-24H224zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24H448c13.3 0 24-10.7 24-24s-10.7-24-24-24H224z"/></svg>}
          array={playlistResults}
          playlists={playlists}
        />

      </div>
    </div>
  )

}