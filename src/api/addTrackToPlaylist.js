import axios from "axios"

export async function addTrackToPlaylist(resultURI, playlistID, token) {

  let tracks = []
  let errorMsg = false

  await axios({ 
    method: 'post', 
    url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
    data: {
      "uris": [`${resultURI}`]
    }
  }).catch(error => errorMsg = error)

  // get newly updated playlist items
  await axios.get(`https://api.spotify.com/v1/playlists/${playlistID}/tracks?limit=100`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }).then((res) => {
    tracks = res.data.items
  }).catch(error => errorMsg = error)

  return {
    errorMsg,
    tracks
  }
}
