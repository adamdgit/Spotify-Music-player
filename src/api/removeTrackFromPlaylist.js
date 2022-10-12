import axios from "axios"

export async function removeTrackFromPlaylist(trackURI, token, playlistID) {

  let tracks = []
  let errorMsg = false

  await axios({ 
    method: 'delete', 
    url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
    data: {
      "tracks": [{
        "uri": `${trackURI}`
      }]
    }
  }).catch(error => errorMsg = error)
  
  await axios.get(`https://api.spotify.com/v1/playlists/${playlistID}/tracks?limit=50`, {
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