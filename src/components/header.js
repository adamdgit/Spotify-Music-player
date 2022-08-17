
import { useState, useContext, useEffect } from "react";
import SearchSongs from "./api/searchSongs";
import axios from "axios";
import { LoginStatusCtx } from "./login";
import { NavLink } from "react-router-dom"

function Header(props) {

  const {token, setToken} = useContext(LoginStatusCtx)

  const logout = () => {
    setToken('')
    window.localStorage.removeItem('token')
  }

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
          <p className="account">Hello:{props.username}</p>
        </span>
      </span>
    </header>
  ) 
}

export default Header