import axios from "axios"

let error

export async function previousTrack(token) {
  // transfer playback to web player SDK
  await axios({ 
    method: 'post', 
    url: `https://api.spotify.com/v1/me/player/previous`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
  }).catch(err => error = err)

  if(error) return error
}
