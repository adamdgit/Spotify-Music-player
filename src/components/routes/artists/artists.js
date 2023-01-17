import { useState, useContext, useEffect } from "react";
import { GlobalContext } from "../login";
import { getUserPlaylists } from "../../../api/getUserPlaylists"
import { getTopArtists } from "../../../api/getTopArtists";
import ArtistsResult from "./ArtistsResult";
import TopSongs from "./TopSongs";

export default function Explore() {

  const { token } = useContext(GlobalContext)
  const { userID } = useContext(GlobalContext)

  const [userPlaylists, setUserPlaylists] = useState([])
  const [artists, setArtists] = useState([])
  const [topSongs, setTopSongs] = useState([])
  const [selectedArtist, setSelectedArtist] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {

    getUserPlaylists(token)
      .then(result => {
        if (result.errorMsg === false) return setUserPlaylists(result.playlists.filter(a => {
          if(a.owner.id === userID) return a
        }))
        else console.error(result.errorMsg)
      })

    getTopArtists(token)
      .then(result => {
        if (result.errorMsg === false) {
          setArtists(result.data.items)
        } else { console.error(result.errorMsg) }
      })

  },[token])

  return (
    <div className="page-wrap">
      <div className="main-content">
        <h1 style={{marginBottom: '2rem'}}>Your top artists: {selectedArtist}</h1>

        <TopSongs 
          topSongs={topSongs}
          isLoading={isLoading}
          userPlaylists={userPlaylists}
        />

        <ArtistsResult 
          token={token}
          artists={artists} 
          setSelectedArtist={setSelectedArtist}
          setIsLoading={setIsLoading}
          setTopSongs={setTopSongs}
        />

      </div>
    </div>
  )
}