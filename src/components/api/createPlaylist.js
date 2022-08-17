import axios from "axios"

let errorMsg

export async function createPlaylist(token, userID){
  await axios({ 
    method: 'post', 
    url: `https://api.spotify.com/v1/users/${userID}/playlists`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
    data: {
      "name": '#New playlist',
      "description": 'add description',
      "public" : false
    }
  }).catch(error => {
    errorMsg = error
  })
  
  if(errorMsg) return errorMsg
}
