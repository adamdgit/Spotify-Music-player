
export function showHideAddToPlaylistBtn(e) {
  if(!e.classList.contains('add-to-playlist')) return
  // if add to playlist button is clicked but a different buttons hidden
  // element is showing, hide it
  if(e.classList.contains('add-to-playlist') && document.querySelector('.show-p') && !e.querySelector('.show-p')) {
    document.querySelector('.show-p').classList.remove('show-p')
  }
  // if hidden element is shown, hide it
  if(e.querySelector('.show-p')) {
    e.querySelector('.show-p').classList.remove('show-p')
  //if hidden element is hidden, show it
  } else {
    e.querySelector('.choose-playlist').classList.add('show-p')
  }
}
