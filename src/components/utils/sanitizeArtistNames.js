// takes in array of artist names and convert to a string
export function sanitizeArtistNames(artists) {
  let names = ''
  artists.forEach((artistName, index) => {
    if (index === 0 && index !== artists.length -1) {
      return names += artistName.name + ', '
    } else if (index === artists.length -1) {
      return names += artistName.name
    } else {
      return names += artistName.name + ', '
    }
  })
  return names.toString()
}