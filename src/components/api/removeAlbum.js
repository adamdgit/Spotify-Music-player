import axios from "axios"

let errorMsg

export async function removeAlbum(token, albumID){
  await axios({ 
    method: 'delete', 
    url: `https://api.spotify.com/v1/me/albums?ids=${albumID}`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
  }).catch(error => errorMsg = error)
  
  if(errorMsg) return errorMsg
}
