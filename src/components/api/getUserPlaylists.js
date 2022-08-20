import axios from "axios"

export async function getUserPlaylists(token) {
  let playlists
  let errorMsg
  
  await axios.get(`https://api.spotify.com/v1/me/playlists`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }).then((res) => {
    playlists = res.data.items
  }).catch(error => errorMsg = error)

  if(errorMsg) return errorMsg
  return playlists
}
