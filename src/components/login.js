import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom"
import axios from "axios";
import Header from "./header";
import Controls from './controls';
import Artists from './pages/artists';
import Library from "./pages/library";
import EditPlaylist from "./pages/editPlaylist";
import Search from "./pages/search";

export const GlobalContext = React.createContext()

function Login() {

  const CLIENT_ID = "1054d21743b44ad1b1bcbf1046e70025"
  const REDIRECT_URI = "http://localhost:3000/spotify"
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
        <svg viewBox="0 0 167.5 167.5" width="80px" height="80px"><title>Spotify</title><path fill="currentColor" d="M83.7 0C37.5 0 0 37.5 0 83.7c0 46.3 37.5 83.7 83.7 83.7 46.3 0 83.7-37.5 83.7-83.7S130 0 83.7 0zM122 120.8c-1.4 2.5-4.6 3.2-7 1.7-19.8-12-44.5-14.7-73.7-8-2.8.5-5.6-1.2-6.2-4-.2-2.8 1.5-5.6 4-6.2 32-7.3 59.6-4.2 81.6 9.3 2.6 1.5 3.4 4.7 1.8 7.2zM132.5 98c-2 3-6 4-9 2.2-22.5-14-56.8-18-83.4-9.8-3.2 1-7-1-8-4.3s1-7 4.6-8c30.4-9 68.2-4.5 94 11 3 2 4 6 2 9zm1-23.8c-27-16-71.6-17.5-97.4-9.7-4 1.3-8.2-1-9.5-5.2-1.3-4 1-8.5 5.2-9.8 29.6-9 78.8-7.2 109.8 11.2 3.7 2.2 5 7 2.7 10.7-2 3.8-7 5-10.6 2.8z"></path></svg>
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
          <Route path="/spotify/" element={<Library />} />
          <Route path="/spotify/artists" element={<Artists />} />
          <Route path="/spotify/search" element={<Search />} />
          <Route path="/spotify/editPlaylist/:id" element={<EditPlaylist />} />
        </Routes>
        <Controls />
      </>
    }
    </GlobalContext.Provider>
  )

}

export default Login