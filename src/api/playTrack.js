import axios from "axios"

export async function playTrack(token, song) {

  let errorMsg = false
  // transfer playback to web player SDK
  await axios({ 
    method: 'put', 
    url: `https://api.spotify.com/v1/me/player/play`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
    data: {
      "uris": [song.uri],
      "offset": { "position": 0 }
    }
  }).catch(err => errorMsg = err)

  return errorMsg
}
