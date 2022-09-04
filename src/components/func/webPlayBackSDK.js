import React from "react";
import { useEffect, useState } from "react";

export default function WebPlayback(props) {

  const [player, setPlayer] = useState(undefined)
  const [is_paused, setPaused] = useState(false)
  const [is_active, setActive] = useState(false)
  const [current_track, setTrack] = useState()

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://sdk.scdn.co/spotify-player.js"
    script.async = true

    document.body.appendChild(script)

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
          name: 'Web Playback SDK',
          getOAuthToken: cb => { cb(props.token); },
          volume: 0.5
      })
      setPlayer(player)
      player.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
      })
      player.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline', device_id);
      })
      player.addListener('player_state_changed', ( state => {
        if (!state) return
        setTrack(state.track_window.current_track)
        setPaused(state.paused)
        player.getCurrentState().then( state => { 
            (!state)? setActive(false) : setActive(true) 
        });
       }));
      player.connect()
    }
  }, [])

  return (
    <div className="container" style={{position: 'absolute', top: '200px'}}>
      <div className="main-wrapper">
        <img src={
          current_track? current_track.album.images[0].url 
          : 'no data'} 
        className="now-playing__cover" alt="" />
        <div className="now-playing__side">
          <div className="now-playing__name">{
            current_track? current_track.name
            : 'no data'
          }</div>
          <div className="now-playing__artist">{
            current_track? current_track.artists[0].name
            : 'no data'
          }</div>
        </div>
        <button className="btn-spotify" onClick={() => { player.previousTrack() }} >
          &lt;&lt;
        </button>
        <button className="btn-spotify" onClick={() => { player.togglePlay() }} >
          { is_paused ? "PLAY" : "PAUSE" }
        </button>
        <button className="btn-spotify" onClick={() => { player.nextTrack() }} >
          &gt;&gt;
        </button>
      </div>
    </div>
  )

}