export function getNearestNode(y, nodes) {
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
