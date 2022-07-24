
import { useState, useEffect, useContext } from "react";
import SearchSongs from "./api/searchSongs";
import axios from "axios";
import { LoginStatusCtx } from "./login";

function Header() {

  const {token, setToken} = useContext(LoginStatusCtx)
  const [username, setUsername] = useState('')

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

  if(token) {
    getUserData()
  }

  return (
    <header className="header-bar">
      <ul className="nav-bar">
        <li className="nav-item active-nav">Explore</li>
        <li className="nav-item">Playlists</li>
      </ul>
      <SearchSongs />
      <span className="user-info">
        <span>
          <button onClick={logout} className="logout">Logout of spotify</button>
          <p className="account">Logged in as: {username}</p>
        </span>
      </span>
    </header>
  ) 
}

export default Header