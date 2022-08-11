import axios from "axios"

let songs = []
let errorMsg

export async function removeTrackFromPlaylist(trackURI, token, playlistID) {
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
    songs = res.data.items
  }).catch(error => errorMsg = error)
  // return error as object if any occur else return new playlist data
  if(errorMsg) return errorMsg
  return songs
}
