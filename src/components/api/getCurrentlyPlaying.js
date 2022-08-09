
export default function GetCurrentlyPlaying({...props}) {
 

  let currentSong = props.currentSong

    /* 
      useEffect(() => {
        if(currentSong) {
          async function getLyrics(artist, title) {
            await axios.get(`http://localhost:3001/lyrics?artist=${artist}&title=${title}`, {
            }).then((res) => {
              setLyrics(res.data.lyrics)
            }).catch(error => console.error(error))
          }
          getLyrics(currentSong.artists[0].name, currentSong.name)
        }
      },[currentSong])

      useEffect(() => {
        let newlyrics = lyrics.replaceAll('\n', '<br/>')
        document.querySelector('.lyrics').innerHTML = newlyrics
      },[lyrics]) 
    */

  return (
    <div className="song-wrap">
    {
      currentSong ?
        <span className="song-info">
          <h2>Playing: {currentSong.name}</h2>
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
          No song currently playing..
        </span>
    }

    <div className="lyrics-wrap">
      <h2 className="lyrics-title">Lyrics</h2>
      <span className='lyrics'>
        connect lyrics api here...
      </span>
    </div>
    
  </div>
  )

}