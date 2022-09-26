import axios from "axios"

let errorMsg
let data

export async function getPlaybackInfo(token){
  await axios({ 
    method: 'get', 
    url: `https://api.spotify.com/v1/me/player`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
  }).then((res) => {
    data = res.data
  }).catch(error => errorMsg = error)
  // return error as object if any occur else return new playlist data
  if(errorMsg) return errorMsg
  return data
}
