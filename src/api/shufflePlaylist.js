import axios from "axios"

export async function shufflePlaylist(token, boolean){

  let errorMsg = false

  await axios({ 
    method: 'put', 
    url: `https://api.spotify.com/v1/me/player/shuffle?state=${boolean}`, 
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }).catch(error => errorMsg = error)
  
  return errorMsg
}
