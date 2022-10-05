import axios from "axios"

export async function followPlaylist(token, playlistID){

  let errorMsg = false

  await axios({ 
    method: 'put', 
    url: `https://api.spotify.com/v1/playlists/${playlistID}/followers`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
    data: {
      "public": false
    }
  }).catch(error => errorMsg = error)
  
  return errorMsg
}
