import axios from "axios"

export async function changePlaylistSong(offset, token, playerURIS){

  let errorMsg = false

  await axios({ 
    method: 'put', 
    url: 'https://api.spotify.com/v1/me/player/play', 
    headers: { 'Authorization': 'Bearer ' + token }, 
    data: {
      "context_uri": `${playerURIS}`,
      "offset": { "position": offset }
    }
  }).catch(error => errorMsg = error)
  
  return errorMsg
}
