import axios from "axios"

export async function getPlaybackInfo(token){

  let errorMsg = false
  let data = []

  await axios({ 
    method: 'get', 
    url: `https://api.spotify.com/v1/me/player`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
  }).then((res) => {
    data = res.data
  }).catch(error => errorMsg = error)

  return {
    errorMsg,
    data
  }
}
