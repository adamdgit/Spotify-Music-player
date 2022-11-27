import axios from "axios"

export async function getTopArtists(token) {

  let data = []
  let errorMsg = false
  
  await axios.get(`https://api.spotify.com/v1/me/top/artists?limit=20`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }).then((res) => {
    data = res.data
  }).catch(error => errorMsg = error)

  return { errorMsg, data }
}
