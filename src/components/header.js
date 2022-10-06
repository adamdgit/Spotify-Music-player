import { useContext, useEffect, useRef } from "react";
import { GlobalContext } from "./login";
import { NavLink } from "react-router-dom"

function Header() {

  const { setToken } = useContext(GlobalContext)
  const { username } = useContext(GlobalContext)
  const { setPlayerIsHidden } = useContext(GlobalContext)

  const nav1 = useRef()
  const nav2 = useRef()
  const nav3 = useRef()

  const logout = () => {
    setToken('')
    window.localStorage.removeItem('token')
  }

  // if playlist is not hidden, and user clicks nav link, hide playlist
  useEffect(() => {

    const navitem1 = nav1.current
    const navitem2 = nav2.current
    const navitem3 = nav3.current

    navitem1.addEventListener('pointerdown', hidePlaylist)
    navitem2.addEventListener('pointerdown', hidePlaylist)
    navitem3.addEventListener('pointerdown', hidePlaylist)

    function hidePlaylist() {
      let playlist = document.querySelector('.playlist-wrap')
      if (!playlist.classList.contains('hide')) {
        playlist.classList.add('hide')
        setPlayerIsHidden(true)
      }
    }

    // cleanup event listeners
    return () => {
      console.log('cleanup listeners')
      navitem1.removeEventListener('pointerdown', hidePlaylist)
      navitem2.removeEventListener('pointerdown', hidePlaylist)
      navitem3.removeEventListener('pointerdown', hidePlaylist)
    }

  }, [])

  return (
    <header className="header-bar">
      <div className="header-wrap">
        <nav className="nav-bar">
          <NavLink to="/" ref={nav1} className={(navData) => (navData.isActive ? "nav-item active" : 'nav-item')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentcolor" width="20px"><path d="M128 192C110.3 192 96 177.7 96 160C96 142.3 110.3 128 128 128C145.7 128 160 142.3 160 160C160 177.7 145.7 192 128 192zM200 160C200 146.7 210.7 136 224 136H448C461.3 136 472 146.7 472 160C472 173.3 461.3 184 448 184H224C210.7 184 200 173.3 200 160zM200 256C200 242.7 210.7 232 224 232H448C461.3 232 472 242.7 472 256C472 269.3 461.3 280 448 280H224C210.7 280 200 269.3 200 256zM200 352C200 338.7 210.7 328 224 328H448C461.3 328 472 338.7 472 352C472 365.3 461.3 376 448 376H224C210.7 376 200 365.3 200 352zM128 224C145.7 224 160 238.3 160 256C160 273.7 145.7 288 128 288C110.3 288 96 273.7 96 256C96 238.3 110.3 224 128 224zM128 384C110.3 384 96 369.7 96 352C96 334.3 110.3 320 128 320C145.7 320 160 334.3 160 352C160 369.7 145.7 384 128 384zM0 96C0 60.65 28.65 32 64 32H512C547.3 32 576 60.65 576 96V416C576 451.3 547.3 480 512 480H64C28.65 480 0 451.3 0 416V96zM48 96V416C48 424.8 55.16 432 64 432H512C520.8 432 528 424.8 528 416V96C528 87.16 520.8 80 512 80H64C55.16 80 48 87.16 48 96z"/></svg>
            Library
          </NavLink>
          <NavLink to="/explore" ref={nav2} className={(navData) => (navData.isActive ? "nav-item active" : 'nav-item')}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentcolor" width="20px"><path d="M287.9 0C297.1 0 305.5 5.25 309.5 13.52L378.1 154.8L531.4 177.5C540.4 178.8 547.8 185.1 550.7 193.7C553.5 202.4 551.2 211.9 544.8 218.2L433.6 328.4L459.9 483.9C461.4 492.9 457.7 502.1 450.2 507.4C442.8 512.7 432.1 513.4 424.9 509.1L287.9 435.9L150.1 509.1C142.9 513.4 133.1 512.7 125.6 507.4C118.2 502.1 114.5 492.9 115.1 483.9L142.2 328.4L31.11 218.2C24.65 211.9 22.36 202.4 25.2 193.7C28.03 185.1 35.5 178.8 44.49 177.5L197.7 154.8L266.3 13.52C270.4 5.249 278.7 0 287.9 0L287.9 0zM287.9 78.95L235.4 187.2C231.9 194.3 225.1 199.3 217.3 200.5L98.98 217.9L184.9 303C190.4 308.5 192.9 316.4 191.6 324.1L171.4 443.7L276.6 387.5C283.7 383.7 292.2 383.7 299.2 387.5L404.4 443.7L384.2 324.1C382.9 316.4 385.5 308.5 391 303L476.9 217.9L358.6 200.5C350.7 199.3 343.9 194.3 340.5 187.2L287.9 78.95z"></path></svg>
            Explore
          </NavLink>
          <NavLink to="/search" ref={nav3} className={(navData) => (navData.isActive ? "nav-item active" : 'nav-item')}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentcolor" width="18px"><path d="M500.3 443.7l-119.7-119.7c27.22-40.41 40.65-90.9 33.46-144.7C401.8 87.79 326.8 13.32 235.2 1.723C99.01-15.51-15.51 99.01 1.724 235.2c11.6 91.64 86.08 166.7 177.6 178.9c53.8 7.189 104.3-6.236 144.7-33.46l119.7 119.7c15.62 15.62 40.95 15.62 56.57 0C515.9 484.7 515.9 459.3 500.3 443.7zM79.1 208c0-70.58 57.42-128 128-128s128 57.42 128 128c0 70.58-57.42 128-128 128S79.1 278.6 79.1 208z"></path></svg>
            Search
          </NavLink>
        </nav>
        <span className="user-info">
          <button onClick={logout} className="logout">
            <svg viewBox="0 0 167.5 167.5" width="2rem" height="2rem"><title>Spotify</title><path fill="currentColor" d="M83.7 0C37.5 0 0 37.5 0 83.7c0 46.3 37.5 83.7 83.7 83.7 46.3 0 83.7-37.5 83.7-83.7S130 0 83.7 0zM122 120.8c-1.4 2.5-4.6 3.2-7 1.7-19.8-12-44.5-14.7-73.7-8-2.8.5-5.6-1.2-6.2-4-.2-2.8 1.5-5.6 4-6.2 32-7.3 59.6-4.2 81.6 9.3 2.6 1.5 3.4 4.7 1.8 7.2zM132.5 98c-2 3-6 4-9 2.2-22.5-14-56.8-18-83.4-9.8-3.2 1-7-1-8-4.3s1-7 4.6-8c30.4-9 68.2-4.5 94 11 3 2 4 6 2 9zm1-23.8c-27-16-71.6-17.5-97.4-9.7-4 1.3-8.2-1-9.5-5.2-1.3-4 1-8.5 5.2-9.8 29.6-9 78.8-7.2 109.8 11.2 3.7 2.2 5 7 2.7 10.7-2 3.8-7 5-10.6 2.8z"></path></svg>
            Logout
          </button>
          <p className="account">Hello: {username}</p>
        </span>
      </div>
    </header>
  ) 
}

export default Header