
import { useState, useContext, useEffect } from "react";
import SearchSongs from "./api/searchSongs";
import axios from "axios";
import { LoginStatusCtx } from "./login";
import { NavLink } from "react-router-dom"

function Header() {

  const {token, setToken} = useContext(LoginStatusCtx)
  const [username, setUsername] = useState('')

  const logout = () => {
    setToken('')
    window.localStorage.removeItem('token')
  }

  useEffect(() => {
    if(token) {
      // get logged in user's display name
      axios.get(`https://api.spotify.com/v1/me`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }).then((res) => {
        return setUsername(res.data.display_name)
      }).catch(error => {
        console.error(error)
        if(error.response.data.error.message == 'The access token expired') {
          logout()
        }
      })
    }
  },[])

  return (
    <header className="header-bar">
      <ul className="nav-bar">
        <NavLink to="/" className={(navData) => (navData.isActive ? "nav-item active" : 'nav-item')}>
          <li>Explore</li>
        </NavLink>
        <NavLink to="/playlists" className={(navData) => (navData.isActive ? "nav-item active" : 'nav-item')}>
          <li>Playlists</li>
        </NavLink>
      </ul>
      <SearchSongs />
      <span className="user-info">
        <span>
          <button onClick={logout} className="logout">Disconnect spotify</button>
          <p className="account">Hello:{username}</p>
        </span>
      </span>
    </header>
  ) 
}

export default Header