
export function showHideAddToPlaylistBtn(e) {
  // modal is child of button clicked
  let clickedNode = e.childNodes[1]

  if (clickedNode.classList.contains('show-p')) {
    return clickedNode.classList.remove('show-p')
  }

  // hide any nodes already open
  let nodes = document.querySelectorAll('.show-p')
  nodes.forEach(node => {
    node.classList.remove('show-p')
  })

  clickedNode.classList.add('show-p')

  // prevent modal displaying outside of screen
  // 125px is height of controls panel
  if(clickedNode.getBoundingClientRect().bottom > (document.querySelector('.page-wrap').offsetHeight + 125)) {
    clickedNode.style.top = `-${clickedNode.clientHeight}px`
  }

  if(clickedNode.getBoundingClientRect().left < 5) {
    clickedNode.style.left = '0px'
    clickedNode.style.right = 'unset'
  }
}
