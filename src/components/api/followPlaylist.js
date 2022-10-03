import axios from "axios"

let errorMsg

export async function followPlaylist(token, playlistID){
  await axios({ 
    method: 'put', 
    url: `https://api.spotify.com/v1/playlists/${playlistID}/followers`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
    data: {
      "public": false
    }
  }).catch(error => errorMsg = error)
  
  if(errorMsg) return errorMsg
}
