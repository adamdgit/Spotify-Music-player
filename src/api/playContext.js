import axios from "axios"

export async function playContext(token, uri) {

  let errorMsg = false

  await axios({ 
    method: 'put', 
    url: `https://api.spotify.com/v1/me/player/play`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
    data: {
      "context_uri": uri,
      "offset": { "position": 0 }
    }
  }).catch(err => errorMsg = err)

  return errorMsg
}
