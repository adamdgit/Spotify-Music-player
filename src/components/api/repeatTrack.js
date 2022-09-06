import axios from "axios"

let errorMsg
// type must be track or context
export async function repeatTrack(token, type){
  await axios({ 
    method: 'put', 
    url: `https://api.spotify.com/v1/me/player/repeat?state=${type}`, 
    headers: { 'Authorization': 'Bearer ' + token }
  }).catch(error => errorMsg = error)
  
  if(errorMsg) return errorMsg
}
