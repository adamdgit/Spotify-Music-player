import SkeletonLoader from "../../SkeletonLoader"
import { getArtistTopTracks } from "../../../api/getArtistTopTracks";

export default function ArtistsResult({ token, artists, setSelectedArtist, setIsLoading, setTopSongs }) {

  const getArtistSongs = async (id) => {
    setIsLoading(true);
    setTopSongs([]);
    document.querySelector('.page-wrap').scroll({top: 0, left: 0, behavior: 'smooth'});

    // creates a small delay to allow the page scroll animation to go off / data fetching
    let { errorMsg, data } = await getArtistTopTracks(token, id);
    if (errorMsg) console.error(errorMsg)
    else {
      const timer = setTimeout(() => {
        setTopSongs(data.tracks)
        setIsLoading(false)
        clearTimeout(timer)
      }, 500);
    }
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