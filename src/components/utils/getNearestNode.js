export function getNearestNode(y, nodes) {

  let closest = {
    element: undefined,
    offset: -Infinity
  };

  for (let i=0; i<nodes.length; i++) {
    const box = nodes[i].getBoundingClientRect();
    const offset = y - box.top - box.height / 2

    if(offset < 0 && offset > closest.offset) {
      closest.element = nodes[i]
      closest.offset = offset
    } 
  }

  return closest.element
}
