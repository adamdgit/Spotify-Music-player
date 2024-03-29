import { useState, useCallback, useEffect } from "react";
import Tooltip from "../Tooltip";

export default function VolumeControl({ player, volumeLS }) {

  const [prevVolume, setPrevVolume] = useState(volumeLS)
  const [isMuted, setIsMuted] = useState(false)
  const [percent, setPercent] = useState(volumeLS) // int between 0-1

  let volumeTrack = null
  const setVolumeTrack = useCallback(node => {
    if(node != null) {
      volumeTrack = node
      volumeTrack.addEventListener('pointerdown', changeVolume)
      document.addEventListener('pointerup', cleanup)
      function changeVolume(e) {
        // check opposite value as state will not update instantly
        if (isMuted === false) {
          setIsMuted(false) 
        }
        const rect = e.target.getBoundingClientRect()
        let calcPercent = Math.min(Math.max(0, e.pageX - rect.x), rect.width) / rect.width
        setPercent(calcPercent) 
        setPrevVolume(calcPercent)
        player.setVolume(calcPercent)
        // stores volume to localstorage, to use on app open
        window.localStorage.setItem('volume', calcPercent)
        document.addEventListener('pointermove', seek)
      }
  
      function seek(e) {
        const rect = volumeTrack.getBoundingClientRect()
        let calcPercent = Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width
        setPercent(calcPercent) 
        setPrevVolume(calcPercent)
        player.setVolume(calcPercent)
        window.localStorage.setItem('volume', calcPercent)
      }
  
      // cleanup listeners when user has set the volume
      function cleanup(e) {
        e.preventDefault()
        document.removeEventListener('pointermove', seek)
      }
    }
  },[])

  useEffect(() => {
    isMuted === true ? player.setVolume(0) : player.setVolume(prevVolume)
  }, [isMuted])

  return (
    <div className="volume-control">
      <button className="volume-btn" onClick={() => setIsMuted(!isMuted) }>
        <Tooltip tip={'Toggle mute'} />
        {
          isMuted === true ? <svg xmlns="http://www.w3.org/2000/svg" fill="currentcolor" width="20px" height="17px" viewBox="0 0 576 512"><path d="M301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM425 167l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z"/></svg>
          : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="20px" height="17px" fill="currentcolor"><path d="M412.6 182c-10.28-8.334-25.41-6.867-33.75 3.402c-8.406 10.24-6.906 25.35 3.375 33.74C393.5 228.4 400 241.8 400 255.1c0 14.17-6.5 27.59-17.81 36.83c-10.28 8.396-11.78 23.5-3.375 33.74c4.719 5.806 11.62 8.802 18.56 8.802c5.344 0 10.75-1.779 15.19-5.399C435.1 311.5 448 284.6 448 255.1S435.1 200.4 412.6 182zM473.1 108.2c-10.22-8.334-25.34-6.898-33.78 3.34c-8.406 10.24-6.906 25.35 3.344 33.74C476.6 172.1 496 213.3 496 255.1s-19.44 82.1-53.31 110.7c-10.25 8.396-11.75 23.5-3.344 33.74c4.75 5.775 11.62 8.771 18.56 8.771c5.375 0 10.75-1.779 15.22-5.431C518.2 366.9 544 313 544 255.1S518.2 145 473.1 108.2zM534.4 33.4c-10.22-8.334-25.34-6.867-33.78 3.34c-8.406 10.24-6.906 25.35 3.344 33.74C559.9 116.3 592 183.9 592 255.1s-32.09 139.7-88.06 185.5c-10.25 8.396-11.75 23.5-3.344 33.74C505.3 481 512.2 484 519.2 484c5.375 0 10.75-1.779 15.22-5.431C601.5 423.6 640 342.5 640 255.1S601.5 88.34 534.4 33.4zM301.2 34.98c-11.5-5.181-25.01-3.076-34.43 5.29L131.8 160.1H48c-26.51 0-48 21.48-48 47.96v95.92c0 26.48 21.49 47.96 48 47.96h83.84l134.9 119.8C272.7 477 280.3 479.8 288 479.8c4.438 0 8.959-.9314 13.16-2.835C312.7 471.8 320 460.4 320 447.9V64.12C320 51.55 312.7 40.13 301.2 34.98z"></path></svg>
        }
      </button>
      <span ref={setVolumeTrack} className="timeline">
        <span className="timeline-thumb" style={{'--progress': `-${100 - (percent * 100)}%`}}>
        </span>
      </span>
    </div>
  )
}