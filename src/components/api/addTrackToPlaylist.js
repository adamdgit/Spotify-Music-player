import axios from "axios"

let errorMsg

export async function addTrackToPlaylist(resultURI, playlistid, token) {
  await axios({ 
    method: 'post', 
    url: `https://api.spotify.com/v1/playlists/${playlistid}/tracks`, 
    headers: { 'Authorization': 'Bearer ' + token }, 
    data: {
      "uris": [`${resultURI}`]
    }
  }).catch(error => errorMsg = error)
  document.querySelector('.show-p').classList.remove('show-p')

  if(errorMsg) return errorMsg
}
