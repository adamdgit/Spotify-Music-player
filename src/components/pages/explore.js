import { useState, useRef, useContext, useEffect } from "react";
import { GlobalContext } from "../login";
import { changePlaylistSong } from "../api/changePlaylistSong";
import axios from "axios";
import Loading from "../Loading";

export default function Explore() {

  const { token } = useContext(GlobalContext)
  const { setContextURI } = useContext(GlobalContext)
  const { setPlaylistID } = useContext(GlobalContext)

  useEffect(() => {
    const getFeaturedPlaylists = async () => {
      await axios.get('https://api.spotify.com/v1/recommendations/available-genre-seeds', {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }).then((res) => {
        console.log(res)
      }).catch(error => console.error(error))
    }
    getFeaturedPlaylists()
  },[token])

  return (
    <div className="page-wrap">
      <div className="main-content">

      </div>
    </div>
  )
}