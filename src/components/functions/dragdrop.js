useEffect(() => {
  // saves draggable elements to an array to prevent cleanup errors
  // otherwise cleanup will say there are no eventlisteners to remove
  let elements = []
  draggables.current.forEach(element => {
    elements.push(element)
    element.addEventListener('dragstart', drag)
  })
  // cleanup event listeners on component re-render
  return () => {
    elements.forEach(element => {
      element.removeEventListener('dragstart', drag)
    })
  }
},[songs])

function drag(e) {
  // create a clone which follows the mouse cursor
  clone = e.target.cloneNode(true)
  e.target.classList.add('move')
  playlist.current.appendChild(clone)
  clone.classList.add('clone')
  // set clones width to same as elements width (width varies with screen size)
  clone.style.width = `${e.target.offsetWidth}px`
  clone.style.top = '-145px'
  clone.style.left = `-${e.offsetX}px`
  clone.style.setProperty('--x', e.clientX + 'px')
  clone.style.setProperty('--y', e.clientY + 'px')
  clone.classList.add('dragging')

  // stop dragstart event listener to allow mousemove listener to take over
  e.preventDefault()
  document.addEventListener('mousemove', mousePos)
}

// on mousemove have clone follow the cursor
function mousePos(e) {
  clone.style.setProperty('--x', e.clientX + 'px')
  clone.style.setProperty('--y', e.clientY + 'px')
  let nearestNode = getNearestNode(e.clientY)
  const moveEl = document.querySelector('.move')
  // swap original element with nearest node
  container.current.insertBefore(moveEl, nearestNode)
  document.addEventListener('mouseup', placeClone)
}

function getNearestNode(y) {
  let nodes = [...document.querySelectorAll('.draggable:not(.clone)')]
  return nodes.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offset = y - box.top - box.height / 2
    if(offset < 0 && offset > closest.offset) {
      return { offset:offset, element: child }
    } else {
      return closest
    }
  }, {offset: Number.NEGATIVE_INFINITY}).element
}

// on mouseup delete the clone and place original element in its current position
function placeClone() {
  if (document.querySelector('.move')) {
    document.querySelector('.move').classList.remove('move')
    document.removeEventListener('mousemove', mousePos)
    document.removeEventListener('mouseup', placeClone)
    clone.remove()
  }
}