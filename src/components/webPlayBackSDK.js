import { useEffect, useState, useContext, useCallback } from "react";
import { transferPlayback } from "./api/transferPlayback";
import { GlobalContext } from "./login";
import { shufflePlaylist } from "./api/shufflePlaylist"
import { repeatTrack } from "./api/repeatTrack";
import { nextTrack } from "./api/nextTrack"
import { previousTrack } from "./api/previousTrack,"
import Loading from "./Loading";
import { convertTime } from "./utils/convertTime";

export default function WebPlayback(props) {

  // global context
  const { token } = useContext(GlobalContext)
  const { playerCBData, setPlayerCBData } = useContext(GlobalContext)
  const { setPlaylistID } = useContext(GlobalContext)
  const { setContextURI } = useContext(GlobalContext)
  // playlist update message
  const { setMessage } = useContext(GlobalContext)

  const [player, setPlayer] = useState(undefined)
  const [isMuted, setIsMuted] = useState(false)
  const [is_paused, setPaused] = useState(true)
  const [shuffle, setShuffle] = useState(false)
  const [current_track, setTrack] = useState()
  const [volume, setVolume] = useState(20)
  const [songLength, setSongLength] = useState(0) // milliseconds
  const [loading, setLoading] = useState(false)
  const [currentTrackPos, setPos] = useState(0) // milliseconds
  const [repeatMode, setRepeatMode] = useState(0)

  const [timeline, setTimeline] = useState()
  const timelineCB = useCallback(node => {
    if(node != null) {
      setTimeline(node)
    }
  },[])

  let runOnce = false

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://sdk.scdn.co/spotify-player.js"
    script.async = true

    document.body.appendChild(script)

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
          name: 'React Webplayer',
          getOAuthToken: cb => { cb(props.token); },
          volume: 0.2
      })

      setPlayer(player)

      player.addListener('ready', ({ device_id }) => {
        transferPlayback(props.token, device_id)
        console.log('Ready with Device ID', device_id);
      })

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      })

      player.connect()

      player.addListener('player_state_changed', ( state => {
        if(!state) return
        console.log(state)
        if (runOnce === false) {
          setPlayerCBData(current => ({...current, type: 'player_ready'}))
          runOnce = true
        }
        setLoading(state.loading)
        setPos(state.position)
        setTrack(state.track_window.current_track)
        setPaused(state.paused)
        setShuffle(state.shuffle)
        // bug with repeat mode? api call not updating repeat mode
        setRepeatMode(state.repeat_mode)
        setPlayerCBData(current => ({...current, track_id: state.track_window.current_track?.id}))
        setSongLength(state.duration)
        setContextURI(state.context.uri)
        // check if URI is playlist or not
        if (!state.context.uri?.includes('playlist')) {
          setPlaylistID('')
        } else {
          // splits uri into 3 strings, returns last string (playlist id)
          setPlaylistID(state.context.uri?.split(":").pop())
        }
      }))
    }
  }, [])

  const shuffleSongs = () => {
    // toggle shuffle between true/false
    shufflePlaylist(props.token, !shuffle)
    setShuffle(!shuffle)

    if (shuffle === false) setMessage('Shuffle enabled')
    else setMessage('Shuffle disabled')
  }

  const repeatSongs = () => {
    // 0 = off, 1 = repeat context, 2 = repeat track
    switch(repeatMode) {
      case 0:
        console.log('context')
        setRepeatMode(repeatMode + 1)
        repeatTrack(props.token, 'context')
        break
      case 1:
        console.log('track')
        setRepeatMode(repeatMode + 1)
        repeatTrack(props.token, 'track')
        break
      case 2:
        console.log('off')
        setRepeatMode(0)
        repeatTrack(props.token, 'off')
        break
      default: 
       setRepeatMode(0)
       repeatTrack(props.token, 'off')
    }
  }

  const changeVolume = (value) => {
    if (+value > 0) setIsMuted(false) 
    else setIsMuted(true)
    setVolume(value)
    let convertedValue = (+value / 100)
    player.setVolume(convertedValue).then(() => {
      console.log('Volume updated!');
    });
  }

  const timelineSeek = (e) => {
    const rect = timeline.getBoundingClientRect()
    const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
    // FIX: songlength not updating when song changes???
    const value = songLength * percent
    console.log(percent, songLength)
    // seek requires value in milliseconds
    player.seek(value).then(() => {
      console.log('Changed position!');
    });
  }

  useEffect(() => {
    if (!timeline) return
    timeline.addEventListener('click', timelineSeek)
    return () => timeline.removeEventListener('click', timelineSeek)
  },[timeline])

  useEffect(() => {

    if (is_paused === false) {
      if (loading === true) setPos(0)
      const timelineUpdate = setInterval(() => {
        setPos(value => value +=1000)
      }, 1000)
      return () => clearInterval(timelineUpdate)
    }

  }, [is_paused])

  return (
    <>
      {
      playerCBData.type !== '' ?
      <div className="playback-wrap">

        <div className="timeline-seek">
          <span>{convertTime(currentTrackPos)}</span>
            <span className="timeline" ref={timelineCB}>
              <span className="timeline-thumb" style={{'--progress': `-${100 - (currentTrackPos / songLength * 100)}%`}}>
                <span className="thumb-indicator"></span>
              </span>
            </span>
          <span>{convertTime(songLength)}</span>
        </div>

        <div className="current-info">
          <img src={
            current_track? current_track.album.images[0].url 
            : 'no data'} 
            width={"90px"}
            height={"90px"}
            alt="" />
          <span style={{display: 'grid', gap: '.5rem'}}>
            <p className="current-track">{
              current_track? current_track.name
              : 'no data'
            }</p>
            <p className="current-artist">{
              current_track? current_track.artists[0].name
              : 'no data'
            }</p>
          </span>
        </div>
  
        <div className="player-btns">
          <button className="shuffle-btn" 
            onClick={() => shuffleSongs()}
            style={shuffle === true? {color: 'var(--blue)'} : {}}
          >
            <svg viewBox="0 0 24 24" height="24px" width="24px" fill="currentcolor"><path d="M16.808 4.655l2.069 1.978h-.527c-1.656 0-3.312.68-4.458 1.814L12.797 9.75l1.179 1.246 1.317-1.527c.764-.794 1.91-1.247 3.057-1.247h.55l-2.07 2.014 1.178 1.179 4.005-3.993-4.026-3.945-1.178 1.179zm1.974 10.998l-1.974-1.888 1.18-1.179 4.024 3.945-4.004 3.993-1.178-1.179 1.954-1.901h-.434c-1.656 0-3.312-.625-4.458-1.667L8.242 9.8C7.35 9.071 6.204 8.55 4.93 8.55H2l.006-1.794 2.965.003c1.784 0 3.312.521 4.459 1.563l5.904 6.185c.765.73 1.911 1.146 3.058 1.146h.39zm-9.02-2.092l-1.52 1.394c-.892.793-2.038 1.36-3.312 1.36H2v1.588h2.93c1.783 0 3.312-.567 4.459-1.701l1.537-1.396-1.164-1.245z"></path></svg>
          </button>
          <button className="previous-btn" onClick={() => { 
            previousTrack(props.token)
            setPlayerCBData(current => ({...current, type: 'track_update'}))
          }} >
            <svg role="img" fill="currentcolor" 
              height="24px" width="24px" viewBox="0 0 16 16">
              <path d="M3.3 1a.7.7 0 01.7.7v5.15l9.95-5.744a.7.7 0 011.05.606v12.575a.7.7 0 01-1.05.607L4 9.149V14.3a.7.7 0 01-.7.7H1.7a.7.7 0 01-.7-.7V1.7a.7.7 0 01.7-.7h1.6z"></path>
            </svg>
          </button>
          <button className="play-btn" onClick={() => { 
            player.togglePlay()
            setPlayerCBData(current => ({...current, type: 'track_play_pause'}))
          }} >
            { 
            is_paused ? 
            <svg role="img" fill="currentcolor" 
              height="40" width="40" xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 384 512">
              <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
            </svg> 
            : 
            <svg role="img" fill="currentcolor" 
              height="40" width="40" xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 320 512">
              <path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/>
            </svg>
            }
          </button>
          <button className="next-btn" onClick={() => { 
            nextTrack(props.token)
            setPlayerCBData(current => ({...current, type: 'track_update'}))
          }} >
            <svg role="img" fill="currentcolor" 
              height="24px" width="24px" viewBox="0 0 16 16">
              <path d="M12.7 1a.7.7 0 00-.7.7v5.15L2.05 1.107A.7.7 0 001 1.712v12.575a.7.7 0 001.05.607L12 9.149V14.3a.7.7 0 00.7.7h1.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7h-1.6z"></path>
            </svg>
          </button>
          <button className="loop-btn" 
            onClick={() => {repeatSongs()}}
            style={repeatMode === 0 ? {} : repeatMode === 1 ? {color: 'var(--blue)'} : {color: 'var(--blue)'}}
          >
            {
              repeatMode === 0 ? 
                <svg role="img" height="20" width="20" viewBox="0 0 16 16" fill="currentcolor">
                  <path d="M0 4.75A3.75 3.75 0 013.75 1h8.5A3.75 3.75 0 0116 4.75v5a3.75 3.75 0 01-3.75 3.75H9.81l1.018 1.018a.75.75 0 11-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 111.06 1.06L9.811 12h2.439a2.25 2.25 0 002.25-2.25v-5a2.25 2.25 0 00-2.25-2.25h-8.5A2.25 2.25 0 001.5 4.75v5A2.25 2.25 0 003.75 12H5v1.5H3.75A3.75 3.75 0 010 9.75v-5z"></path>
                </svg>
              : repeatMode === 1 ?
                <svg role="img" height="20" width="20" viewBox="0 0 16 16" fill="currentcolor">
                  <path d="M0 4.75A3.75 3.75 0 013.75 1h8.5A3.75 3.75 0 0116 4.75v5a3.75 3.75 0 01-3.75 3.75H9.81l1.018 1.018a.75.75 0 11-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 111.06 1.06L9.811 12h2.439a2.25 2.25 0 002.25-2.25v-5a2.25 2.25 0 00-2.25-2.25h-8.5A2.25 2.25 0 001.5 4.75v5A2.25 2.25 0 003.75 12H5v1.5H3.75A3.75 3.75 0 010 9.75v-5z"></path>
                </svg>
              : 
                <svg role="img" height="20" width="20" viewBox="0 0 16 16" fill="currentcolor">
                  <path d="M0 4.75A3.75 3.75 0 013.75 1h.75v1.5h-.75A2.25 2.25 0 001.5 4.75v5A2.25 2.25 0 003.75 12H5v1.5H3.75A3.75 3.75 0 010 9.75v-5zM12.25 2.5h-.75V1h.75A3.75 3.75 0 0116 4.75v5a3.75 3.75 0 01-3.75 3.75H9.81l1.018 1.018a.75.75 0 11-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 111.06 1.06L9.811 12h2.439a2.25 2.25 0 002.25-2.25v-5a2.25 2.25 0 00-2.25-2.25z"></path><path d="M9.12 8V1H7.787c-.128.72-.76 1.293-1.787 1.313V3.36h1.57V8h1.55z"></path>
                </svg>
            }
          </button>
        </div>
  
        <span className="volume-control">
          <input className="volume-slider" type="range" min="0" max="100" value={volume} onChange={(e) => {changeVolume(e.target.value)}} />
          <button className="volume-btn" onClick={() => {
            setIsMuted(!isMuted)
            isMuted === false ? changeVolume(0) : changeVolume(20) 
          }}>
            {
              isMuted === true ? <svg xmlns="http://www.w3.org/2000/svg" fill="currentcolor" width="20px" viewBox="0 0 576 512"><path d="M301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM425 167l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z"/></svg>
              : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="20px" fill="currentcolor"><path d="M412.6 182c-10.28-8.334-25.41-6.867-33.75 3.402c-8.406 10.24-6.906 25.35 3.375 33.74C393.5 228.4 400 241.8 400 255.1c0 14.17-6.5 27.59-17.81 36.83c-10.28 8.396-11.78 23.5-3.375 33.74c4.719 5.806 11.62 8.802 18.56 8.802c5.344 0 10.75-1.779 15.19-5.399C435.1 311.5 448 284.6 448 255.1S435.1 200.4 412.6 182zM473.1 108.2c-10.22-8.334-25.34-6.898-33.78 3.34c-8.406 10.24-6.906 25.35 3.344 33.74C476.6 172.1 496 213.3 496 255.1s-19.44 82.1-53.31 110.7c-10.25 8.396-11.75 23.5-3.344 33.74c4.75 5.775 11.62 8.771 18.56 8.771c5.375 0 10.75-1.779 15.22-5.431C518.2 366.9 544 313 544 255.1S518.2 145 473.1 108.2zM534.4 33.4c-10.22-8.334-25.34-6.867-33.78 3.34c-8.406 10.24-6.906 25.35 3.344 33.74C559.9 116.3 592 183.9 592 255.1s-32.09 139.7-88.06 185.5c-10.25 8.396-11.75 23.5-3.344 33.74C505.3 481 512.2 484 519.2 484c5.375 0 10.75-1.779 15.22-5.431C601.5 423.6 640 342.5 640 255.1S601.5 88.34 534.4 33.4zM301.2 34.98c-11.5-5.181-25.01-3.076-34.43 5.29L131.8 160.1H48c-26.51 0-48 21.48-48 47.96v95.92c0 26.48 21.49 47.96 48 47.96h83.84l134.9 119.8C272.7 477 280.3 479.8 288 479.8c4.438 0 8.959-.9314 13.16-2.835C312.7 471.8 320 460.4 320 447.9V64.12C320 51.55 312.7 40.13 301.2 34.98z"></path></svg>
            }
          </button>
        </span>
  
      </div>
      : <Loading loadingMsg={'Loading spotify player...'} />
      }
    </>
  )
}