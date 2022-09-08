import axios from "axios"

let errorMsg
let data

export async function createPlaylist(token, userID){
  await axios({ 
    method: 'post', 
    url: `https://api.spotify.com/v1/users/${userID}/playlists`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
    data: {
      "name": '#New playlist',
      "description": 'add description',
      "public" : false
    }
  }).then((res) => {
    data = res.data
  }).catch(error => errorMsg = error)
  // return error as object if any occur else return new playlist data
  if(errorMsg) return errorMsg
  return data
}
