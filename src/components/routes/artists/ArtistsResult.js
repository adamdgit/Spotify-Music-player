import SkeletonLoader from "../../SkeletonLoader"
import { getArtistTopTracks } from "../../../api/getArtistTopTracks";

export default function ArtistsResult({ token, artists, setSelectedArtist, setIsLoading, setTopSongs }) {

  const getArtistSongs = (id) => {
    setIsLoading(true);
    setTopSongs([]);
    document.querySelector('.page-wrap').scroll({top: 0, left: 0, behavior: 'smooth'});

    const timer = setTimeout(() => {
      getArtistTopTracks(token, id)
      .then(result => {
        if (result.errorMsg === false) {
          setTopSongs(result.data.tracks)
          setIsLoading(false)
        } else console.error(result.errorMsg)
      })
      clearTimeout(timer)
    }, 400);
  }

  return (
    <div className="artist-wrap">
      {artists.length !== 0 ?
        artists.map(artist => {
          return <span key={artist.id} className="result-artist" onClick={() => {
            getArtistSongs(artist.id)
            setSelectedArtist(artist.name)}
            }>
            <h2>{artist.name}</h2>
            <img src={
              artist.images.length === 0 ? 'no image found'
              : artist.images[2].url} 
              alt={''} />
          </span>
        })
        : <SkeletonLoader type={'artist'} />
      }
    </div>
  )
}