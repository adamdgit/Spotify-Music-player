import axios from "axios"

let errorMsg

export async function changePlaylistSong(token, userID, playlistName, playlistDesc, publicPlaylist){
  await axios({ 
    method: 'post', 
    url: `https://api.spotify.com/v1/users/${userID}/playlists`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
    data: {
      "name": playlistName,
      "description": playlistDesc,
      "public" : publicPlaylist
    }
  }).catch(error => errorMsg = error)
  
  if(errorMsg) return errorMsg
}

