import axios from "axios"

let songs = []
let errorMsg

export async function changePlaylistOrder(dragElIndex, dragElNewIndex, token, playlistID) {
  // when moving element down the list we must add 1 to its index
  // eg: move element from position 0 to 4 we insert before 5 not 4
  if(dragElIndex < dragElNewIndex) {
    dragElNewIndex = dragElNewIndex+1
  }
  // send playlist track index changes to API
  await axios({ 
    method: 'put', 
    url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
    data: {
      "range_start": dragElIndex, // first item to change
      "insert_before": dragElNewIndex, // location to insert item
      "range_length": 1 // number of items to change
    }
  }).catch(error => errorMsg = error)

  // get newly updated playlist items
  await axios.get(`https://api.spotify.com/v1/playlists/${playlistID}/tracks?limit=50`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }).then((res) => {
    songs = res.data.items
  }).catch(error => errorMsg = error)
  // return error as object if any occur else return new playlist data
  if(errorMsg) return errorMsg
  return songs
}
