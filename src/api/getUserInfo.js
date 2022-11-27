import axios from "axios"

export async function getUserInfo(token) {

  let data = []
  let errorMsg = false
  
  await axios.get(`https://api.spotify.com/v1/me`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }).then((res) => { data = res.data })
    .catch(error => errorMsg = error)

  return { errorMsg, data }
}
