import axios from "axios"

let error

export async function transferPlayback(token, device_id) {
  // transfer playback to web player SDK
  await axios({ 
    method: 'put', 
    url: `https://api.spotify.com/v1/me/player`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
    data: {
      'device_ids' : [device_id]
    }
  }).catch(err => error = err)

  if(error) return error
}
