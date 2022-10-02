import axios from "axios"

let error

export async function playTrack(token, song) {
  // transfer playback to web player SDK
  await axios({ 
    method: 'put', 
    url: `https://api.spotify.com/v1/me/player/play`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
    data: {
      "uris": [song.uri],
      "offset": { "position": 0 }
    }
  }).catch(err => error = err)

  if(error) return error
}
