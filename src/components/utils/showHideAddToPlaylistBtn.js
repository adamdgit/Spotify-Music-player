
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
  // if modal appears below the screen, change its position so user can see it
  // +100 is a magic number, accounting for padding and margins as javascript
  // does not have a built in way to get an elements height including those properties
  if(e.querySelector('.choose-playlist').getBoundingClientRect().bottom > (document.querySelector('.page-wrap').offsetHeight + 100)) {
    e.querySelector('.choose-playlist').style.top = '-355px'
  }
}
