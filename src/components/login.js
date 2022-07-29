
import React, { useState, useEffect, useRef } from "react";
import Header from "./header";
import Controls from './controls';
import Explore from './pages/explore';
import Playlists from "./pages/playlists";
import Home from "./pages/home";
import { Route, Routes } from "react-router-dom"

export const LoginStatusCtx = React.createContext()

function Login() {

  const CLIENT_ID = process.env.REACT_APP_CLIENT_ID
  const REDIRECT_URI = "http://localhost:3000"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"
  const SCOPE = 'user-read-private%20user-read-recently-played%20user-read-email%20user-read-playback-state%20user-modify-playback-state%20playlist-modify-private%20playlist-modify-public%20playlist-read-private%20streaming'

  // Global context items
  const [token, setToken] = useState('')
  const [playerCBData, setPlayerCBData] = useState({
    is_playing: true,
    progress_ms: 0,
    volume: 0,
    deviceId: '',
    track_id: ''
  })
  const [playlistData, setPlaylistData] = useState({
    uris: [],
    play: true,
    autoplay: true,
    playlist_id: '',
    playlist_name: '',
    playlist_uri: '',
    playlist_image: '',
    playlist_tracks_href: '',
    playlist_desc: ''
  })

  useEffect(() => {

    let hash = window.location.hash
    let token = window.localStorage.getItem('token')

    // get token from redirected URL and save to local storage
    if (!token && hash) {
      token = hash.substring(1).split('&').find(elem => elem.startsWith('access_token')).split('=')[1]
      window.location.hash = ''
      window.localStorage.setItem('token', token)
    }

    setToken(token)

  },[token])
  
  return (
    <LoginStatusCtx.Provider value={{token, setToken, playlistData, setPlaylistData, playerCBData, setPlayerCBData}}>
    {
      !token ?
      <div className="login-wrap">
        <h1>Login to your spotify account to use this app.</h1>
        <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`} className="login">Connect Spotify</a>
      </div>
      :
      <>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/playlists" element={<Playlists />} />
        </Routes>
        <Controls />
      </>
    }
    </LoginStatusCtx.Provider>
  )

}

export default Login