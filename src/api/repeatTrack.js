import axios from "axios"

// type must be track, context or off
export async function repeatTrack(token, type){

  let errorMsg = false

  await axios({ 
    method: 'put', 
    url: `https://api.spotify.com/v1/me/player/repeat?state=${type}`, 
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }).catch(error => errorMsg = error)
  
  return errorMsg
}
