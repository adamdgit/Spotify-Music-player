import axios from "axios"

let errorMsg

export async function changePlaylistSong(offset, token, playerURIS){
  await axios({ 
    method: 'put', 
    url: 'https://api.spotify.com/v1/me/player/play', 
    headers: { 'Authorization': 'Bearer ' + token }, 
    data: {
      "context_uri": `${playerURIS}`,
      "offset": { "position": offset }
    }
  }).catch(error => errorMsg = error)
  
  if(errorMsg) return errorMsg
}
