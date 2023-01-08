import { useContext } from "react"
import PlaylistInfo from "./playlistInfo"
import { GlobalContext } from "../routes/login";
import WebPlayback from "./webPlayBackSDK";
import StatusMessage from "../utils/statusMessage";

function Controls() {

  // global context
  const { token } = useContext(GlobalContext)
  const { playerIsHidden, setPlayerIsHidden } = useContext(GlobalContext)

  return (
    <>
    <PlaylistInfo playerIsHidden={playerIsHidden} />
    <div className="controls">
      <WebPlayback />
      <button className={'show-hide-playlist-btn'} onClick={() => setPlayerIsHidden(!playerIsHidden)} >
        <svg className={playerIsHidden === true ? '' : 'rotate-btn'} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" height="30px" width="30px" fill="currentcolor">{/*! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc.*/}<path d="M9.39 265.4l127.1-128C143.6 131.1 151.8 128 160 128s16.38 3.125 22.63 9.375l127.1 128c9.156 9.156 11.9 22.91 6.943 34.88S300.9 320 287.1 320H32.01c-12.94 0-24.62-7.781-29.58-19.75S.2333 274.5 9.39 265.4z"/></svg>
      </button>
      <StatusMessage />
    </div>
    </>
  ) 
}

export default Controls