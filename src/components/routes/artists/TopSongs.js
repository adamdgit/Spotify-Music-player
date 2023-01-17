import { GlobalContext } from "../login"
import { useContext } from "react"
import SkeletonLoader from "../../SkeletonLoader"
import AddToPlaylistBtn from "../../AddToPlaylistBtn"
import { sanitizeArtistNames } from "../../utils/sanitizeArtistNames"
import { playTrack } from "../../../api/playTrack"
import { addTrackToPlaylist } from "../../../api/addTrackToPlaylist"

export default function TopSongs({ topSongs, isLoading, userPlaylists }) {

  const { token } = useContext(GlobalContext)
  const { userID } = useContext(GlobalContext)
  const { setSongs } = useContext(GlobalContext)
  const { setContextURI } = useContext(GlobalContext)
  const { contextID, setContextID } = useContext(GlobalContext)
  const { setMessage } = useContext(GlobalContext)

  const playSong = async (uri) => {
    let errorMsg = await playTrack(token, uri)
    if (errorMsg) return console.error(errorMsg);
    else {
      // clear context to allow new data to be pulled from api in playlistInfo
      setSongs([])
      setContextID('')
      // save new URIS data to global context
      setContextURI(uri)
    }
  }

  const addToPlaylist = async (resultURI, playlistid, playlistName) => {
    let { errorMsg, tracks } = await addTrackToPlaylist(resultURI, playlistid, token)
    if (errorMsg) return console.error(errorMsg);
    if (contextID === playlistid) setSongs(tracks);

    setMessage({msg: `Song added to playlist: ${playlistName}`, needsUpdate: true})
  }

  return (
    <div className="artist-top-songs">
      {
        topSongs.map(track => {
          return (
            <div key={track.id} className="result-small">
            <img 
              src={
                track.album.images.length === 0 ?
                'no image found' :
                track.album.images.length === 3 ?
                track.album.images[2].url :
                track.album.images[0].url } 
              alt={
                track.album.images.length === 0 ?
                'no image found' :
                `${track.name} album art` }
            />
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
  )
}