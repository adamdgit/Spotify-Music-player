import { useState, useContext, useEffect } from "react";
import { GlobalContext } from "./login";
import { sanitizeArtistNames } from "../utils/sanitizeArtistNames";
import { getUserPlaylists } from "../../api/getUserPlaylists"
import { addTrackToPlaylist } from "../../api/addTrackToPlaylist";
import { playTrack } from "../../api/playTrack";
import { getArtistTopTracks } from "../../api/getArtistTopTracks";
import { getTopArtists } from "../../api/getTopArtists";
import SkeletonLoader from "../SkeletonLoader";
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
  const [selectedArtist, setSelectedArtist] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const addToPlaylist = async (resultURI, playlistid, playlistName) => {
    let { errorMsg, tracks } = await addTrackToPlaylist(resultURI, playlistid, token)
    if (errorMsg) return console.error(errorMsg);
    if (contextID === playlistid) setSongs(tracks);

    setMessage({msg: `Song added to playlist: ${playlistName}`, needsUpdate: true})
  }

  const playSong = async (uri) => {
    let errorMsg = await playTrack(token, uri)
    if (errorMsg) return console.error(errorMsg);
    else {
      // clear context if no errors
      setSongs([])
      setContextID('')
      // save new URIS data to global context
      setContextURI(uri)
    }
  }

  const getArtistSongs = (id) => {
    setIsLoading(true);
    setTopSongs([]);
    document.querySelector('.page-wrap').scroll({top: 0, left: 0, behavior: 'smooth'});

    const timer = setTimeout(() => {
      getArtistTopTracks(token, id)
      .then(result => {
        if (result.errorMsg === false) {
          setTopSongs(result.data.tracks)
          setIsLoading(false)
        } else console.error(result.errorMsg)
      })
      clearTimeout(timer)
    }, 400);
  }

  useEffect(() => {

    getUserPlaylists(token)
      .then(result => {
        if (result.errorMsg === false) return setUserPlaylists(result.playlists.filter(a => {
          if(a.owner.id === userID) return a
        }))
        else console.error(result.errorMsg)
      })

  },[userID])

  useEffect(() => {

    getTopArtists(token)
      .then(result => {
        if (result.errorMsg === false) {
          setArtists(result.data.items)
        } else { console.error(result.errorMsg) }
      })

  },[token])

  return (
    <div className="page-wrap">
      <div className="main-content">
        <h1 style={{marginBottom: '2rem'}}>Your top artists: {selectedArtist}</h1>
        <div className="artist-top-songs">
        {
          topSongs.map(track => {
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
              <span className="info">
                <h3>{track.name}</h3>
                <p>{sanitizeArtistNames(track.artists)}</p>
              </span>
              <AddToPlaylistBtn 
                track={track}
                userID={userID}
                userPlaylists={userPlaylists} 
                addToPlaylist={addToPlaylist} 
              />
              <button className="play" onClick={() => playSong(track.uri)}>
                <svg viewBox="0 0 16 16" height="20px" width="20px" fill="currentcolor"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>
              </button>
            </div>
            )
          })
        }
        {isLoading === true ? <SkeletonLoader type={'song'} /> : <></>}
        </div>
        <div className="artist-wrap">
          {artists.length !== 0 ?
            artists.map(artist => {
              return <span key={artist.id} className="result-artist" onClick={() => {
                getArtistSongs(artist.id)
                setSelectedArtist(artist.name)}
                }>
                <h2>{artist.name}</h2>
                <img src={
                  artist.images.length === 0 ? 'no image found'
                  : artist.images[2].url} 
                  alt={''} />
              </span>
            })
            : <SkeletonLoader type={'artist'} />
          }
        </div>
      </div>
    </div>
  )
}