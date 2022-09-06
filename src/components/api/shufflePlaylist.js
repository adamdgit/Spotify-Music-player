import axios from "axios"

let errorMsg

export async function shufflePlaylist(token, boolean){
  await axios({ 
    method: 'put', 
    url: `https://api.spotify.com/v1/me/player/shuffle?state=${boolean}`, 
    headers: { 'Authorization': 'Bearer ' + token }
  }).catch(error => errorMsg = error)
  
  if(errorMsg) return errorMsg
}
