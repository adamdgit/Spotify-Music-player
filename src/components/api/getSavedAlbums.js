import axios from "axios"

export async function getSavedAlbums(token) {
  let albums
  let errorMsg
  
  await axios.get(`https://api.spotify.com/v1/me/albums`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }).then((res) => {
    albums = res.data.items
  }).catch(error => errorMsg = error)

  if(errorMsg) return errorMsg
  return albums
}
