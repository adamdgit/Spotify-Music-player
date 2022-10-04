import { useState, useContext, useEffect } from "react";
import { GlobalContext } from "../login";
import { sanitizeArtistNames } from "../utils/sanitizeArtistNames";
import { getUserPlaylists } from "../api/getUserPlaylists"
import { showHideAddToPlaylistBtn } from "../utils/showHideAddToPlaylistBtn";
import { addTrackToPlaylist } from "../api/addTrackToPlaylist";
import { playTrack } from "../api/playTrack";
import axios from "axios";
import Loading from "../Loading";

export default function Explore() {

  const { token } = useContext(GlobalContext)
  const { userID } = useContext(GlobalContext)
  const { setSongs } = useContext(GlobalContext)
  const { setContextURI } = useContext(GlobalContext)
  const { contextID, setContextID } = useContext(GlobalContext)
  // playlist update message
  const { setMessage } = useContext(GlobalContext)

  const [userPlaylists, setUserPlaylists] = useState([])
  const [artists, setArtists] = useState([])
  const [topSongs, setTopSongs] = useState([])

  const addToPlaylist = (resultURI, playlistid, playlistName) => {
    addTrackToPlaylist(resultURI, playlistid, token)
      .then(result => {
        if(result.length > 0) {
          // Only update currently playing song data if
          // playlist IDs match, as we need to sync the newly
          // added song to the current playlist
          if (contextID === playlistid) {
            return setSongs(result)
          }
          return
        }
        console.error(result)
      })
      setMessage({msg: `Song added to playlist: ${playlistName}`, needsUpdate: true})
      document.querySelector('.show-p').classList.remove('show-p')
  }

  const playSong = (song) => {
    playTrack(token, song)
    .then(result => {
      if (!result) return
      console.error(result)
    })
    // save new URIS data to global context (playlist or track)
    setContextURI(song.uri)
    // remove playlist ID as track is playing not playlist
    setContextID('')
  }

  useEffect(() => {

    getUserPlaylists(token)
    .then(result => { 
      if (result?.length === 0) return setUserPlaylists([])
      // only show user owned playlists as you can't add songs to a playlist not owned by you
      else if (result?.length > 0) return setUserPlaylists(
        result?.filter(a => {
          if(a.owner.id === userID) return a
          return null
        })
        )
      else console.error(result) 
    })

  },[token, userID])

  useEffect(() => {

    const test = async () => {
      await axios.get('https://api.spotify.com/v1/me/top/artists?limit=10', {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }).then((res) => {
        setArtists(res.data.items)
      }).catch(error => console.error(error))
    }
    test()

  },[token])

  useEffect(() => {

    if (artists.length > 0) {
      const getTopTracks = async (id, name) => {
        await axios.get(`https://api.spotify.com/v1/artists/${id}/top-tracks?market=AU`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }).then((res) => {
          setTopSongs(current => 
            [...current, {artistName: name,
              artistID: id,
              aritstTopTracks: [res.data.tracks] 
            }]
          )
        }).catch(error => console.error(error))
      }

      artists.map(artist => {
        getTopTracks(artist.id, artist.name)
      })
    }

  },[token, artists])

  return (
    <div className="page-wrap">
      <div className="main-content">
        <div className="artist-wrap">
          <h1>Your top artists:</h1>
          {
            topSongs.length !== 0 ? topSongs.map((value, index) => {
              return (
                <div key={value.artistID+index} className="artist">
                  <h2>{value.artistName}</h2>
                  <span className="artist-top-songs">
                    {
                      value.aritstTopTracks[0].map(track => {
                        return (
                          <div key={track.id} className="result-small">
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
                            } />
                            <span>
                              <h3>{track.name}</h3>
                              <p>{sanitizeArtistNames(track.artists)}</p>
                            </span>
                            <button className="add-to-playlist" onClick={(e) => showHideAddToPlaylistBtn(e.target)}>
                              <svg style={{pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg" fill="currentcolor" width="20px" viewBox="0 0 512 512"><path d="M0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84.02L256 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 .0003 232.4 .0003 190.9L0 190.9z"/></svg>
                              <span className="choose-playlist">
                                <h3>Add to playlist:</h3>
                                <ul>
                                  {
                                    userPlaylists? userPlaylists.map((playlist, index) => {
                                      return <li key={index} style={{listStyle:"none"}} onClick={() => addToPlaylist(track.uri, playlist.id, playlist.name)}>{playlist.name}</li>
                                    })
                                    : <li>No playlists found</li>
                                  }
                                </ul>
                              </span>
                            </button>
                            <button className="play" onClick={() => playSong(track)}>
                              <svg viewBox="0 0 16 16" height="20px" width="20px" fill="currentcolor"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>
                            </button>
                          </div>
                        )
                      })
                    }
                  </span>
                </div>
              )
            })
            : <Loading loadingMsg={'Fetching your top artists...'}/>
          }
        </div>
      </div>
    </div>
  )
}