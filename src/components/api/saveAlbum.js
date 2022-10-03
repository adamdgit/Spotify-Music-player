import axios from "axios"

let errorMsg

export async function saveAlbum(token, albumID){
  await axios({ 
    method: 'put', 
    url: `https://api.spotify.com/v1/me/albums`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
    data: {
      "ids" : [
        albumID
      ]
    }
  }).catch(error => errorMsg = error)
  
  if(errorMsg) return errorMsg
}
