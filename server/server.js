const express = require('express')
const puppeteer = require('puppeteer')
const cors = require('cors')
const app = express()
const PORT = 3001

app.use(cors())

async function scrapeLyrics(artist, title) {
  // take query from spotify object data of currently playing song
  // use artist + song title to query google
  let QUERY = `${artist} ${title}`
  // if space at end of query, remove it
  if (QUERY.slice(-1) === ' ') {
    QUERY = QUERY.slice(0,-1)
  }
  // replace spaces with +
  QUERY = QUERY.replaceAll(' ', '+')

  // insert formatted query to URL to get lyrics from google
  const URL = `https://www.google.com/search?q=${QUERY}+azlyrics`

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(URL)

  await Promise.all([
    page.waitForNavigation({waitUntil: 'domcontentloaded'}),
    page.click('[data-ved][href*="azlyrics.com"]'),
    ]);

  console.log(page.url())

  const [lyricsEl] = await Promise.all([
    page.waitForSelector('[class*="col-xs-12 col-lg-8 text-center"]>div~div~div~div~div'),
    page.$('[class*="col-xs-12 col-lg-8 text-center"]>div~div~div~div~div'),
    ]);

  //const lyricsEl = await page.$('body > div.container.main-page > div > div.col-xs-12.col-lg-8.text-center > div:nth-child(8)')
  //const lyricsEl = await page.$('body>routable-page>ng-outlet>song-page>div>div>div.song_body.column_layout>div.column_layout-column_span.column_layout-column_span--primary>div>defer-compile:nth-child(1)>lyrics>div>div.lyrics>section>p');

  // get innerhtml of element
  const output = (await lyricsEl.getProperty('innerText')).jsonValue()

  if(output === null || output === undefined) {
    output = "couldn't find lyrics"
  }

  browser.close()
  
  return (output)
}

app.get('/lyrics', async (req, res) => {
  const lyrics = await scrapeLyrics(req.query.artist, req.query.title) || "Could not find lyrics"
  res.json({ lyrics })
})

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})
