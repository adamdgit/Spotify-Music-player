import axios from "axios"

export async function getLyrics(url){

  let data = null
  let errorMsg = false

  await axios({ 
    method: 'get', 
    url: url, 
    headers: { 
      "Access-Control-Allow-Origin": "*",
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  }).then(result => data = result)
  .catch(error => errorMsg = error)
  
  return { errorMsg, data }

}