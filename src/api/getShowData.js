import axios from "axios"

export async function getShowData(token, id) {

  let data = []
  let errorMsg = false
  
  await axios.get(`https://api.spotify.com/v1/shows/${id}`, {
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
