import { useEffect, useState, useContext } from "react"
import axios from "axios"
import Loading from "./Loading"
import { GlobalContext } from "./login"

export default function CurrentSong() {

  const { token } = useContext(GlobalContext)
  const { playerCBType } = useContext(GlobalContext)
  const { currentTrackID } = useContext(GlobalContext)

  const [currentItem, setCurrentItem] = useState()

  // when player updates currentTrackID get new track info
  useEffect(() => {
    // only runs once player is ready otherwise value would be an empty string
    if(playerCBType !== '') {
      const getCurrentTrack = async () => {
        await axios.get(`https://api.spotify.com/v1/tracks/${currentTrackID}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }).then(result => { 
          if (result.data) return setCurrentItem(result.data)
          else console.error(result) 
        })
      }
      getCurrentTrack()
    }
  },[currentTrackID])

  return (
    <div className="song-wrap">
    {
      currentItem ?
      <span className="song-info">
        <h2>Playing: {currentItem.name}</h2>
        <img className="album-large"
          src={
          currentItem.album.images.length === 0 ?
          'no image found'
          : currentItem.album.images.length > 1 ?
          currentItem.album.images[1].url
          : currentItem.album.images[0].url
          } alt={
          currentItem.album.images.length === 0 ?
          'no image found' :
          `${currentItem.name} album art`
          }/>
        <ul>
          <li><h3>Artists:</h3>
          <p>
            {currentItem.artists.length > 1 
            ? currentItem.artists.map(artist => {
            return `${artist.name}, `
            })
            : currentItem.artists[0].name
            }
          </p>
          </li>
          <li>
            <h3>Album: </h3>
            <p>{currentItem.album.name}</p>
          </li>
          <li>
            <h3>Released: </h3>
            <p>{currentItem.album.release_date}</p>
          </li>
        </ul>
      </span>
      : currentItem?.length === 0 ?
      <span className="song-info">
        No song data found.
      </span>
      : <Loading loadingMsg={'Loading spotify data...'} />
    }

    <div className="lyrics-wrap">
      <h2 className="lyrics-title">Lyrics</h2>
      <span className="lyrics">connect lyrics api...</span>
    </div>
    
  </div>
  )

}