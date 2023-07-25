import { GlobalContext } from "../routes/login";
import { useContext } from "react";
import { changePlaylistSong } from "../../api/changePlaylistSong"
import { convertTime } from "../utils/convertTime";
import Tooltip  from "../Tooltip"

export default function ShowContext({ songs }) {

  const { token } = useContext(GlobalContext)
  const { currentTrackID } = useContext(GlobalContext)
  const { contextURI } = useContext(GlobalContext)

  return (
    <div>
    {
      songs.map((song, index) => {
        if (song === null || song === undefined) return null
        return (
          <span key={song.id}
            className={currentTrackID === song.id ? "draggable selected" : "draggable"}>
            <span>{index+1}</span>
            <button className="play-song-btn" onClick={() => changePlaylistSong(index, token, contextURI)}>
              <Tooltip tip={'Play'} />
              <img 
                  src={
                  song.images.length === 0 ?
                  'no image found' :
                  song.images.length === 3 ?
                  song.images[2].url :
                  song.images[0].url}
                  alt={
                  song.images.length === 0 ?
                  'no image found' :
                  `${song.name} - episode art`}
                  />
            </button>
            <span className="draggable-trackname">
              <h1>{song.name}</h1>
              <p>{song.release_date}</p>
            </span>
            <p className="song-length">{convertTime(song.duration_ms)}</p>
          </span>
        )
      })
    }
  </div>
  )
}
