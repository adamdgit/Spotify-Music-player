import { useState, useContext, useEffect } from "react";
import { GlobalContext } from "../login";
import { sanitizeArtistNames } from "../utils/sanitizeArtistNames";
import { getUserPlaylists } from "../../api/getUserPlaylists"
import { addTrackToPlaylist } from "../../api/addTrackToPlaylist";
import { playTrack } from "../../api/playTrack";
import axios from "axios";
import Loading from "../Loading";
import AddToPlaylistBtn from "../AddToPlaylistBtn";

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
        if (result.errorMsg === false) return setUserPlaylists(result.playlists.filter(a => {
          if(a.owner.id === userID) return a
          return null
        }))
        else console.error(result.errorMsg)
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

  },[token, userID])

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
                            <AddToPlaylistBtn 
                              track={track}
                              userPlaylists={userPlaylists} 
                              addToPlaylist={addToPlaylist} 
                            />
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