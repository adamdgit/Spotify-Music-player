import { useContext, useEffect, useState } from "react";
import { LoginStatusCtx } from "../login";
import axios from "axios"

export default function Home() {

  // global context
  const { token } = useContext(LoginStatusCtx)

  const [categories, setCategories] = useState([])
  const [categoryPlaylists, setCategoryPlaylists] = useState([])

  const getCategoryPlaylist = async (categoryID) => {
    await axios.get(`https://api.spotify.com/v1/browse/categories/${categoryID}/playlists`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    }).then((res) => {
      setCategoryPlaylists(res.data.playlists.items)
    }).catch(error => console.error(error))   
  }

  useEffect(() => {

    const getCurrentTrack = async () => {
      await axios.get(`https://api.spotify.com/v1/browse/categories?locale=AU`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }).then((res) => {
        setCategories(res.data.categories.items)
      }).catch(error => console.error(error))
    }
    getCurrentTrack()

  },[token])

  return (
    <div className="page-wrap">
      <div className="main-content">
        <h1 className="featured">Home</h1>
        <div className={'category-playlists'}>
        {
          categoryPlaylists ? categoryPlaylists.map((playlist, index) => {
            return (
              <span key={index} className={'category-item'}>
                <h2>{playlist.name}</h2>
                <p>{playlist.description}</p>
              </span>
            )
          })
          :<></>
        }
        </div>
        {
          categories.length !== 0 ?
          categories.map((result, i) => {
            return (
              <div key={i} className={'home-result'} data-id={result.id}>
                <span className="home-category">
                  <img src={result.icons[0].url} alt={result.name + 'icon'} width={'200px'} height={'200px'} />
                  <h2>{result.name}</h2>
                  <button className="play" onClick={() => getCategoryPlaylist(result.id)}>
                    Explore {result.name}
                  </button>
                </span>
              </div>
            )
          })
          : <></>
        }
      </div>
    </div>
  )
}