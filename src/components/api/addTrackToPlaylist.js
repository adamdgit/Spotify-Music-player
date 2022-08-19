import axios from "axios"

let songs = []
let errorMsg

export async function addTrackToPlaylist(resultURI, playlistID, token) {
  await axios({ 
    method: 'post', 
    url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
    data: {
      "uris": [`${resultURI}`]
    }
  }).catch(error => errorMsg = error)

  // get newly updated playlist items
  await axios.get(`https://api.spotify.com/v1/playlists/${playlistID}/tracks?limit=50`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }).then((res) => {
    songs = res.data.items
  }).catch(error => errorMsg = error)

  if(errorMsg) return errorMsg
  return songs
}
