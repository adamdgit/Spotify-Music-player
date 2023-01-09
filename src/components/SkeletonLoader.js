
export default function SkeletonLoader({ type }) {

  const skeletonPlaylist = {
    display: 'block',
    background: 'var(--secondary-blue)',
    height: '200px',
    animation: 'loading 1.5s ease-in-out infinite'
  };

  const skeletonArtist = {
    display: 'block',
    background: 'var(--secondary-blue)',
    height: '270px',
    width: '250px',
    animation: 'loading 1.5s ease-in-out infinite'
  };

  const skeletonSong = {
    display: 'block',
    background: 'var(--secondary-blue)',
    height: '100px',
    width: '100%',
    animation: 'loading 1.5s ease-in-out infinite'
  };

  return (
    <>
      <span style={type === 'playlist' ? skeletonPlaylist : type === 'song' ? skeletonSong : skeletonArtist}></span>
      <span style={type === 'playlist' ? skeletonPlaylist : type === 'song' ? skeletonSong : skeletonArtist}></span>
      <span style={type === 'playlist' ? skeletonPlaylist : type === 'song' ? skeletonSong : skeletonArtist}></span>
      <span style={type === 'playlist' ? skeletonPlaylist : type === 'song' ? skeletonSong : skeletonArtist}></span>
      <span style={type === 'playlist' ? skeletonPlaylist : type === 'song' ? skeletonSong : skeletonArtist}></span>
      <span style={type === 'playlist' ? skeletonPlaylist : type === 'song' ? skeletonSong : skeletonArtist}></span>
    </>
  )
}