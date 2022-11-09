import axios from "axios"

export async function unfollowPlaylist(token, playlistID){

  let errorMsg = false

  await axios({ 
    method: 'delete', 
    url: `https://api.spotify.com/v1/playlists/${playlistID}/followers`, 
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }).catch(error => errorMsg = error)
  
  return errorMsg
}
