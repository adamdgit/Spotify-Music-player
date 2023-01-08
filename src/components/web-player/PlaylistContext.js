import { GlobalContext } from "../routes/login";
import { useContext } from "react";
import { addTrackToPlaylist } from "../../api/addTrackToPlaylist"
import { changePlaylistSong } from "../../api/changePlaylistSong"
import { sanitizeArtistNames } from "../utils/sanitizeArtistNames";
import { convertTime } from "../utils/convertTime";
import AddToPlaylistBtn from "../AddToPlaylistBtn"
import Tooltip from "../Tooltip"

export default function PlaylistContext({ songs, playlistOwner }) {

  // Global context
  const { token } = useContext(GlobalContext)
  const { setMessage } = useContext(GlobalContext)
  const { userID } = useContext(GlobalContext)
  const { currentTrackID } = useContext(GlobalContext)
  const { contextURI } = useContext(GlobalContext)
  const { playlists } = useContext(GlobalContext)

  const addToPlaylist = (resultURI, playlistid, playlistName) => {
    addTrackToPlaylist(resultURI, playlistid, token)
      .then(result => { 
        if (result.errorMsg === false) return
        else console.error(result.errorMsg)
      })
      setMessage({msg: `Song added to playlist: ${playlistName}`, needsUpdate: true})
  }

  return (
    <div>
      {
        songs.map((song, index) => {
          if (song === null || song === undefined) return null
          return (
            <span key={index} data-index={index} 
              style={playlistOwner === userID ? {gridTemplateColumns: '18px 80px auto 40px'} : {}} 
              className={currentTrackID === song.track.id ? "draggable selected" : "draggable"}>
              <span>{index+1}</span>
              <button className="play-song-btn" onClick={() => changePlaylistSong(index, token, contextURI)}>
                <Tooltip tip={'Play'} />
                <img 
                  src={
                  song.track.album.images.length === 0 ?
                  'no image found' :
                  song.track.album.images.length === 3 ?
                  song.track.album.images[2].url :
                  song.track.album.images[0].url}
                  alt={
                  song.track.album.images.length === 0 ?
                  'no image found' :
                  `${song.track.name} album art`}
                  />
              </button>
              <span className="draggable-trackname">
                <h1>{song.track.name}</h1>
                <p>{sanitizeArtistNames(song.track.artists)}</p>
              </span>
              <p className="song-length">{convertTime(song.track.duration_ms)}</p>
              {
                playlistOwner === userID ? <></>
                :
                <AddToPlaylistBtn 
                  track={song.track}
                  userID={userID}
                  userPlaylists={playlists}
                  addToPlaylist={addToPlaylist}
                />
              }
            </span>
          )
        })
      }
    </div>
  )
}