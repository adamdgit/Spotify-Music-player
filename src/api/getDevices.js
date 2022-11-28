import axios from "axios"

export async function getDevices(token) {

  let devices = []
  let errorMsg = false
  
  await axios.get(`https://api.spotify.com/v1/me/player/devices`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }).then((res) => {
    devices = res.data.devices
  }).catch(error => errorMsg = error)

  return { errorMsg, devices }
}
