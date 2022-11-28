import axios from "axios"

export async function searchSongs(token, query) {

  let errorMsg = false
  let searchResult = []

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
    searchResult = res.data
  }).catch(error => console.error(error))

  return { errorMsg, searchResult }
}