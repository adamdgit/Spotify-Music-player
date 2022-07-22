import { useState, useEffect, useRef } from "react";
import React from 'react';

function Playlist() {

  const [lyrics, setLyrics] = useState('')

  const container = useRef()
  const playlist = useRef()
  let draggables = useRef([])
  let clone = null

  const songData = [
    {
      song: 'White America',
      artist: 'Eminem',
      album: 'The Eminem Show',
      songLength: '5:25',
      genre: 'Rap/Hip Hop',
      producer: 'Dr-Dre',
      label: 'Aftermath, Shady, Interscope',
      released: '26th May 2002',
      albumArtURL: 'https://upload.wikimedia.org/wikipedia/en/3/35/The_Eminem_Show.jpg'
    }, {
      song: 'Mockingbird',
      artist: 'Eminem',
      album: 'Encore',
      songLength: '4:11',
      genre: 'Rap/Hip Hop',
      producer: 'Dr-Dre',
      label: 'Aftermath, Shady, Interscope',
      released: '25th April 2005',
      albumArtURL: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Encore_%28Eminem_album%29_coverart.jpg'
    }, {
      song: 'My Name Is',
      artist: 'Eminem',
      album: 'The Slim Shady LP',
      songLength: '4:28',
      genre: 'Rap/Hip Hop',
      producer: 'Dr-Dre',
      label: 'Aftermath, Shady, Interscope',
      released: '25th January 1995',
      albumArtURL: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/35/Eminem_-_The_Slim_Shady_LP_CD_cover.jpg/220px-Eminem_-_The_Slim_Shady_LP_CD_cover.jpg'
    }
  ]
  // dynamically change this later
  let currentSong = songData[1]

  useEffect(() => {
    draggables.current.forEach(element => {
      element.addEventListener('dragstart', drag)
    })
    // cleanup event listeners on component re-render
    return () => {
      draggables.current.forEach(element => {
        element.removeEventListener('dragstart', drag)
      })
    }
  },[])

  function drag(e) {
    // create a clone which follows the mouse cursor
    clone = e.target.cloneNode(true)
    e.target.classList.add('move')
    playlist.current.appendChild(clone)
    clone.classList.add('clone')
    // set clones width to same as elements width (width varies with screen size)
    clone.style.width = `${e.target.offsetWidth}px`
    clone.style.top = '-145px'
    clone.style.left = `-${e.offsetX}px`
    clone.style.setProperty('--x', e.clientX + 'px')
    clone.style.setProperty('--y', e.clientY + 'px')
    clone.classList.add('dragging')

    // stop dragstart event listener to allow mousemove listener to take over
    e.preventDefault()
    document.addEventListener('mousemove', mousePos)
  }

  // on mousemove have clone follow the cursor
  function mousePos(e) {
    clone.style.setProperty('--x', e.clientX + 'px')
    clone.style.setProperty('--y', e.clientY + 'px')
    let nearestNode = getNearestNode(e.clientY)
    const moveEl = document.querySelector('.move')
    // swap original element with nearest node
    container.current.insertBefore(moveEl, nearestNode)
    document.addEventListener('mouseup', placeClone)
  }

  function getNearestNode(y) {
    let nodes = [...document.querySelectorAll('.draggable:not(.clone)')]
    return nodes.reduce((closest, child) => {
      const box = child.getBoundingClientRect()
      const offset = y - box.top - box.height / 2
      if(offset < 0 && offset > closest.offset) {
        return { offset:offset, element: child }
      } else {
        return closest
      }
    }, {offset: Number.NEGATIVE_INFINITY}).element
  }
  
  // on mouseup delete the clone and place original element in its current position
  function placeClone() {
    if (document.querySelector('.move')) {
      document.querySelector('.move').classList.remove('move')
      document.removeEventListener('mousemove', mousePos)
      document.removeEventListener('mouseup', placeClone)
      clone.remove()
    }
  }

  return (
    <div className="playlist-wrap" ref={playlist}>
      
      <div className="song-wrap">
          {
            currentSong?
              <span className="song-info">
                <img className="album-large" src={currentSong.albumArtURL} alt={`${currentSong.album} Album art`} />
                <ul>
                  <li><h3>Title: </h3>{currentSong.song}</li>
                  <li><h3>Artist: </h3>{currentSong.artist}</li>
                  <li><h3>Album: </h3>{currentSong.album}</li>
                  <li><h3>Genre: </h3>{currentSong.genre}</li>
                  <li><h3>Released: </h3>{currentSong.released}</li>
                </ul>
              </span>
            : 
              <span>
                No song selected
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
        <h1 className="playlist-title">Playlist: $playlistName</h1>
        <div className="song-category">
          <h3>#</h3>
          <h3>Art</h3>
          <h3>Title</h3>
          <h3>Album</h3>
          <h3>Length</h3>
        </div>
        
        <div className="container" ref={container}>
          {
            songData.map((obj, index) => {
              return (
                <span key={index} className="draggable" draggable="true" ref={el => draggables.current[index] = el}>
                  <span>{index+1}</span>
                  <img src={obj.albumArtURL} alt={`${obj.album} Album art`} draggable="false" />
                  <span>
                    <h1>{obj.song}</h1>
                    <h2>{obj.artist}</h2>
                  </span>
                  <h3>{obj.album}</h3>
                  <span>
                    <p className="song-length">{obj.songLength}</p>
                  </span>
                </span>
              )
            })
          }
        </div>
      </div>
    </div>
  ) 
}

export default Playlist