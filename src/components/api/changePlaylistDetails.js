import axios from "axios"

export async function changePlaylistDetails(token, playlistID, playlistDesc, playlistName, isPublic){
  
  let errorMsg = false

  await axios({ 
    method: 'put', 
    url: `https://api.spotify.com/v1/playlists/${playlistID}`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
    data: {
      "name": playlistName,
      "description": playlistDesc,
      "public": isPublic
    }
  }).catch(error => errorMsg = error)
  
  return errorMsg
}
