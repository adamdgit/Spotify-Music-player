import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom"
import axios from "axios";
import Header from "./header";
import Controls from './controls';
import Explore from './pages/explore';
import UserPlaylists from "./pages/userPlaylists";
import EditPlaylist from "./pages/editPlaylist";

export const GlobalContext = React.createContext()

function Login() {

  const CLIENT_ID = process.env.REACT_APP_CLIENT_ID
  const REDIRECT_URI = "http://localhost:3000"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"
  const SCOPE = 'user-read-private%20user-read-recently-played%20user-read-email%20user-read-playback-state%20user-modify-playback-state%20playlist-modify-private%20playlist-modify-public%20playlist-read-private%20streaming'

  // Global context items
  const [token, setToken] = useState('')
  const [playerCBData, setPlayerCBData] = useState({
    is_paused: true,
    progress_ms: 0,
    type: '',
    track_id: ''
  })
  const [contextURI, setContextURI] = useState('')
  const [playerOffset, setPlayerOffset] = useState(0)
  const [playlistID, setPlaylistID] = useState('')
  const [username, setUsername] = useState('')
  const [userID, setUserID] = useState('')
  const [songs, setSongs] = useState([])
  const [message, setMessage] = useState('')

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

    if(token) {
      // get logged in user's display name
      axios.get(`https://api.spotify.com/v1/me`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }).then((res) => {
        setUserID(res.data.id)
        setUsername(res.data.display_name)
      }).catch(error => {
        console.error(error)
      })
    }

  },[token])
  
  return (
    <GlobalContext.Provider value={{
      token, setToken, 
      username, setUsername, 
      userID, setUserID, 
      songs, setSongs, 
      message, setMessage, 
      playlistID, setPlaylistID, 
      contextURI, setContextURI, 
      playerOffset, setPlayerOffset, 
      playerCBData, setPlayerCBData}}>
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
          <Route path="/" element={<Explore />} />
          <Route path="/playlists" element={<UserPlaylists token={token} userID={userID}/>} />
          <Route path="/editPlaylist/:id" element={<EditPlaylist />} />
        </Routes>
        <Controls />
      </>
    }
    </GlobalContext.Provider>
  )

}

export default Login