import axios from "axios"

export async function previousTrack(token) {

  let errorMsg = false

  await axios({ 
    method: 'post', 
    url: `https://api.spotify.com/v1/me/player/previous`, 
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }).catch(err => errorMsg = err)

  return errorMsg
}
