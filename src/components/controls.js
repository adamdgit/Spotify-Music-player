import { useState, useContext } from "react"
import Playlist from "./playlist"
import { LoginStatusCtx } from "./login";
import SpotifyWebPlayer from "react-spotify-web-playback/lib";

function MusicPlayer() {
  
  const { token, setToken } = useContext(LoginStatusCtx)
  const { playerData, setPlayerData } = useContext(LoginStatusCtx)
  let [playerIsHidden, setPLayerIsHidden] = useState(true)

  // use player callback to check state eg: is is playing?
  // next 2 tracks
  // current track
  // volume
  // is active
  // current device id

  return (
    <>
    <Playlist playerIsHidden={playerIsHidden} />
    <div className="controls">
      <SpotifyWebPlayer
        token={token}
        callback={state => console.log(state.isPlaying)}
        uris={playerData.uris}
        offset={playerData.offset}
        styles={{
          bgColor:'#111',
          color:'#fff',
          sliderHandleColor: '#fff',
          trackArtistColor: '#ccc',
          trackNameColor: '#ccc'
        }}
        initialVolume={.2}
        play={playerData.play}
        autoPlay={true}
      />
      <button className={playerIsHidden === true ? 'show-hide-playlist-btn' : 'show-hide-playlist-btn rotate-btn'} onClick={() => setPLayerIsHidden(!playerIsHidden)} >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="20px" fill="currentcolor">/*! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.*/<path d="M9.39 265.4l127.1-128C143.6 131.1 151.8 128 160 128s16.38 3.125 22.63 9.375l127.1 128c9.156 9.156 11.9 22.91 6.943 34.88S300.9 320 287.1 320H32.01c-12.94 0-24.62-7.781-29.58-19.75S.2333 274.5 9.39 265.4z"/></svg>
      </button>
    </div>
    </>
  ) 
}

export default MusicPlayer