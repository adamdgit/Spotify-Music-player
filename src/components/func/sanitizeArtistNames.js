// takes in array of artist names and convert to a string
export function sanitizeArtistNames(artists) {
  let names = []
  artists.map(artistName => {
    names.push(artistName.name)
  })
  return names.toString()
}