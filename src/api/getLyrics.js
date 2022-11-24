import axios from "axios"

export async function getLyrics(query){

  let trackID = null
  let data = null
  let errorMsg = false

  await axios({
    method: 'GET',
    url: 'https://genius-song-lyrics1.p.rapidapi.com/search',
    params: {q: query, per_page: '1', page: '1'},
    headers: {
      'X-RapidAPI-Key': '769cd24bbamsh1fb4150e925e97ap125ffcjsn7c416d1919c5',
      'X-RapidAPI-Host': 'genius-song-lyrics1.p.rapidapi.com'
    }
  }).then(result => {
    trackID = result.data.response.hits[0].result.id
  }).catch(error => errorMsg = error)

  await axios({ 
    method: 'GET',
    url: `https://genius-song-lyrics1.p.rapidapi.com/songs/${trackID}/lyrics`,
    headers: {
      'X-RapidAPI-Key': '769cd24bbamsh1fb4150e925e97ap125ffcjsn7c416d1919c5',
      'X-RapidAPI-Host': 'genius-song-lyrics1.p.rapidapi.com'
    }
  }).then(result => data = result.data.response.lyrics)
  .catch(error => errorMsg = error)
  
  return { errorMsg, data }

}