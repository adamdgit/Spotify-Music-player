import axios from "axios"

export async function removeAlbum(token, albumID){

  let errorMsg = false

  await axios({ 
    method: 'delete', 
    url: `https://api.spotify.com/v1/me/albums?ids=${albumID}`, 
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    } 
  }).catch(error => errorMsg = error)
  
  return errorMsg
}
