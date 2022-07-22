import axios from 'axios'

export default function GetLyrics() {

  const UID = '10583'
  const TOKENID = '2pdUbBZ4cDynIZgU'
  const TERM = 'without me'
  const ARTIST = 'eminem'
  const API_URL = `https://www.stands4.com/services/v2/lyrics.php?uid=${UID}&tokenid=${TOKENID}&term=${TERM}&artist=${ARTIST}&format=json`

  //const [results, setResults] = useState([])

  const getRecommendations = async () => {
    try {
      const {data} = await axios.get(API_URL, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }
      })
      console.log(data)
      //return setResults(data)
    } catch (error) {
      console.error(error)
    }
  }

  getRecommendations()

}