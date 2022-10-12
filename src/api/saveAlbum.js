import axios from "axios"

export async function saveAlbum(token, albumID){

  let errorMsg = false

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
  
  return errorMsg
}
