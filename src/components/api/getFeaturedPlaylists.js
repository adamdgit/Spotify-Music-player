import axios from "axios"

export async function getFeaturedPlaylists(token) {
  
  let data
  let errorMsg
  
  await axios.get(`https://api.spotify.com/v1/browse/featured-playlists`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }).then((res) => {
    data = res.data.playlists.items
  }).catch(error => errorMsg = error)

  if(errorMsg) return errorMsg
  return data
}
