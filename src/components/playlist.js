import { useState, useEffect, useRef, useContext } from "react";
import React from 'react';
import { LoginStatusCtx } from "./login";
import axios from "axios";

function Playlist({ playerIsHidden }) {

  // global context
  const { token, setToken } = useContext(LoginStatusCtx)
  const { playlistData, setPlaylistData } = useContext(LoginStatusCtx)

  const [lyrics, setLyrics] = useState('')
  const [currentSong, setCurrentSong] = useState()
  const [songs, setSongs] = useState([])

  const container = useRef()
  const playlist = useRef()
  let draggables = useRef([])
  let clone = null
  let Playlist_ID = ''

  function convertTime(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return (
      seconds == 60 ?
      (minutes+1) + ":00" :
      minutes + ":" + (seconds < 10 ? "0" : "") + seconds
    );
  }

  useEffect(() => {
    
    const getCurrentlyPlaying = async () => {
      await axios.get(`https://api.spotify.com/v1/me/player/currently-playing`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }).then((res) => {
        console.log(res.data)
        setCurrentSong(res.data.item)
      }).catch(error => console.error(error))
    }
    getCurrentlyPlaying()
    
  },[playlistData])

  useEffect(() => {

    Playlist_ID = playlistData.playlist_id

    const getPlaylistItems = async () => {
      await axios.get(`https://api.spotify.com/v1/playlists/${Playlist_ID}/tracks`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }).then((res) => {
        setSongs(res.data.items)
      }).catch(error => console.error(error))
    }
    getPlaylistItems()

  },[currentSong])

  return (
    <div className={playerIsHidden === true ? "playlist-wrap hide" : "playlist-wrap"} ref={playlist}>
      
      <div className="song-wrap">
          {
            currentSong?
              <span className="song-info">
                <h2>Currently playing:</h2>
                <h3>{currentSong.name}</h3>
                <img className="album-large" src={currentSong.album.images[0].url} alt={`${currentSong.album.name} Album art`} />
                <ul>
                  <li><h3>Artists:</h3>
                    {currentSong.artists.length > 1 
                    ? currentSong.artists.map(artist => {
                    return `${artist.name}, `
                    })
                    : currentSong.artists[0].name
                    }
                  </li>
                  <li><h3>Album: </h3>{currentSong.album.name}</li>
                  <li><h3>Released: </h3>{currentSong.album.release_date}</li>
                </ul>
              </span>
            : 
              <span className="song-info">
                Play a song to show data
              </span>
          }

        <div className="lyrics-wrap">
          <h2>Lyrics</h2>
          <span className='lyrics'>
            {lyrics}
          </span>
        </div>
        
      </div>

      <div className="playlist">
        <h1 className="playlist-title">{playlistData.playlist_name}</h1>
        <div className="song-category">
          <h3>#</h3>
          <h3>Album</h3>
          <h3>Title</h3>
          <h3>Length</h3>
        </div>
        
        <div className="container" ref={container}>
          {
            !songs.length == 0 ? songs.map((obj, index) => {
              return (
                <span key={index} className={currentSong.name === obj.track.name ? "draggable selected" : "draggable"} draggable="true" ref={el => draggables.current[index] = el}>
                  <span>{index+1}</span>
                  <img src={obj.track.album.images[1].url} alt={`${obj.track.name} Album art`} draggable="false" />
                  <span>
                    <h1>{obj.track.name}</h1>
                    <h2>
                      {obj.track.artists.length > 1 
                      ? obj.track.artists.map(artist => {
                      return `${artist.name}, `
                      })
                      : obj.track.artists[0].name}
                    </h2>
                  </span>
                  <span>
                    <p className="song-length">{convertTime(obj.track.duration_ms)}</p>
                  </span>
                </span>
              )
            }) : <h1>No playlist data</h1>
          }
        </div>
      </div>
    </div>
  ) 
}

export default Playlist