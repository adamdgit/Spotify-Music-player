import { GlobalContext } from "../routes/login";
import { useContext } from "react";
import { addTrackToPlaylist } from "../../api/addTrackToPlaylist"
import { changePlaylistSong } from "../../api/changePlaylistSong"
import { sanitizeArtistNames } from "../utils/sanitizeArtistNames";
import { convertTime } from "../utils/convertTime";
import AddToPlaylistBtn from "../AddToPlaylistBtn"
import Tooltip  from "../Tooltip"

export default function AlbumContext({ songs, playlistArt, playlistName }) {

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
              className={currentTrackID === song.id ? "draggable selected" : "draggable"}>
              <span>{index+1}</span>
              <button className="play-song-btn" onClick={() => changePlaylistSong(index, token, contextURI)}>
                <Tooltip tip={'Play'} />
                <img 
                  onClick={() => { changePlaylistSong(index, token, contextURI) }}
                  src={playlistArt? playlistArt : 'no image found'} 
                  alt={playlistArt? `${playlistName} playlist cover art` : 'no image found'} 
                />
              </button>
              <span className="draggable-trackname">
                <h1>{song.name}</h1>
                <p>{sanitizeArtistNames(song.artists)}</p>
              </span>
              <p className="song-length">{convertTime(song.duration_ms)}</p>
              <AddToPlaylistBtn 
                track={song}
                userID={userID}
                userPlaylists={playlists}
                addToPlaylist={addToPlaylist}
              />
            </span>
          )
        })
      }
    </div>
  )
}