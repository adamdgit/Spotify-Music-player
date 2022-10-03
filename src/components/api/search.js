import axios from "axios"

let errorMsg
let result

export async function searchSongs(token, query) {
  await axios.get('https://api.spotify.com/v1/search', {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    params: {
      q: query,
      type: 'track,album,playlist',
      limit: 10
    }
  }).then((res) => {
    result = res.data
  }).catch(error => console.error(error))

  if(errorMsg) return errorMsg
  return result
}
