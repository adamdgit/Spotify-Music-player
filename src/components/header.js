import { useState, useEffect } from "react";
import SearchSongs from "./search/searchSongs";
import axios from "axios";

function Header() {

  const CLIENT_ID = "1054d21743b44ad1b1bcbf1046e70025"
  const REDIRECT_URI = "http://localhost:3000"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"
  const SCOPE = 'user-read-email user-modify-playback-state playlist-modify-private playlist-read-private'

  const [token, setToken] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {

    const hash = window.location.hash
    let token = window.localStorage.getItem('token')

    // get token from redirected URL and save to local storage
    if (!token && hash) {
      token = hash.substring(1).split('&').find(elem => elem.startsWith('access_token')).split('=')[1]
      window.location.hash = ''
      window.localStorage.setItem('token', token)
    }

    setToken(token)

  },[])

  const logout = () => {
    setToken('')
    window.localStorage.removeItem('token')
  }

  // get logged in user's display name
  async function getUserData() {
    const API_URL = `https://api.spotify.com/v1/me`
      try {
        const {data} = await axios.get(API_URL, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })
        return setUsername(data.display_name)
      } catch (error) {
        console.error(error)
      }
  }

  // if logged in get display name
  if(token) {
    getUserData()
  }

  return (
    <header className="header-bar">
      <h1>Musiq</h1>
      <ul className="nav-bar">
        <li className="nav-item active-nav">Explore</li>
        <li className="nav-item">Playlists</li>
      </ul>
      <SearchSongs token={token} />
      <span className="user-info">
        {
          // if no token is set show login to spotify button
          !token ?
          <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`} className="login">Connect Spotify</a>
          : 
          <span>
            <button onClick={logout} className="logout">Logout of spotify</button>
            <p className="account">Logged in as: {username}</p>
          </span>
        }
      </span>
    </header>
  ) 
}

export default Header