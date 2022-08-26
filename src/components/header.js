import { useContext } from "react";
import { LoginStatusCtx } from "./login";
import { NavLink } from "react-router-dom"
import SearchSongs from "./func/searchSongs";

function Header() {

  const { token, setToken } = useContext(LoginStatusCtx)
  const { username } = useContext(LoginStatusCtx)

  const logout = () => {
    setToken('')
    window.localStorage.removeItem('token')
  }

  return (
    <header className="header-bar">
      <div className="header-wrap">
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
            <p className="account">Hello: {username}</p>
          </span>
        </span>
      </div>
    </header>
  ) 
}

export default Header