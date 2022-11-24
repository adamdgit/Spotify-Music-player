import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom"
import axios from "axios";
import Header from "./header";
import Controls from './Controls';
import Artists from './pages/artists';
import Library from "./pages/library";
import EditPlaylist from "./pages/editPlaylist";
import Search from "./pages/search";

export const GlobalContext = React.createContext()

function Login() {
  
  const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
  const REDIRECT_URI = "http://localhost:3000/spotify/library"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"
  const SCOPE = 'user-library-read%20user-library-modify%20user-top-read%20user-read-private%20user-read-recently-played%20user-read-email%20user-read-playback-state%20user-modify-playback-state%20playlist-modify-private%20playlist-modify-public%20playlist-read-private%20streaming'

  // Global context items
  const [token, setToken] = useState('')
  const [playerCBType, setPlayerCBType] = useState('')
  const [currentTrackID, setCurrentTrackID] = useState('')
  const [contextURI, setContextURI] = useState('') // album, playlist etc
  const [contextID, setContextID] = useState('')
  const [username, setUsername] = useState('')
  const [userID, setUserID] = useState('')
  const [songs, setSongs] = useState([]) // playlist items
  const [message, setMessage] = useState({msg: '', needsUpdate: false}) // playlist update message
  const [playerIsHidden, setPlayerIsHidden] = useState(true)

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
        // we get 401 access token expired
        // redirect -> endpoint
        console.error(error)
        setToken('')
        window.localStorage.removeItem('token')
        //window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`
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
      contextID, setContextID, 
      contextURI, setContextURI, 
      playerCBType, setPlayerCBType,
      currentTrackID, setCurrentTrackID,
      playerIsHidden, setPlayerIsHidden
    }}>
    {
    !token ?
      <div className="login-wrap">
        <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`} className="login">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" width="80px" height="80px" fill="currentColor">{/* Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. */}<path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z"/></svg>
          Grant Access to App
        </a>
        <p style={{textAlign: 'center', maxWidth: '800px'}}>
          Unfortunately you can only access the app if you are added to the users whitelist by me personally.
          Spotify doesn't allow anyone to access developer apps without requesting an extension. 
          You can email me if you wan't the test the app personally or watch the video demo below.
        </p>
        <iframe style={{aspectRatio: '16/9', width: '100%', minWidth: '320px', maxWidth: '600px'}} src="https://www.youtube.com/embed/lUDfNqNpk6Q" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
      </div>
    :
      <>
        <Header />
        <Routes>
          <Route path="/library" element={<Library />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/search" element={<Search />} />
          <Route path="/editPlaylist/:id" element={<EditPlaylist />} />
        </Routes>
        <Controls />
      </>
    }
    </GlobalContext.Provider>
  )

}

export default Login