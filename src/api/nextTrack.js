import axios from "axios"

export async function nextTrack(token) {

  let errorMsg = false
  // transfer playback to web player SDK
  await axios({ 
    method: 'post', 
    url: `https://api.spotify.com/v1/me/player/next`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
  }).catch(err => errorMsg = err)

  return errorMsg
}
