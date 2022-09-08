import axios from "axios"

let error

export async function nextTrack(token) {
  // transfer playback to web player SDK
  await axios({ 
    method: 'post', 
    url: `https://api.spotify.com/v1/me/player/next`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
  }).catch(err => error = err)

  if(error) return error
}
