import axios from "axios"

export async function createPlaylist(token, userID){

  let errorMsg = false
  let playlistData = []

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
    playlistData = res.data
  }).catch(error => errorMsg = error)

  return {
    errorMsg,
    playlistData
  }
}
