import axios from "axios"

let errorMsg

export async function unfollowPlaylist(token, playlistID){
  await axios({ 
    method: 'delete', 
    url: `https://api.spotify.com/v1/playlists/${playlistID}/followers`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
  }).catch(error => errorMsg = error)
  
  if(errorMsg) return errorMsg
}
