import * as Cheerio from 'cheerio';
import puppeteer from 'puppeteer';

async function fetchPageContent(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  const content = await page.content(); // 페이지의 전체 HTML을 가져옴
  await browser.close();
  return content;
}

const html = await fetchPageContent('https://charts.youtube.com/charts/TopSongs/kr/weekly');
const $ = Cheerio.load(html);
const divChartTableContainer = $('ytmc-entry-row');
const list = [];
// eslint-disable-next-line array-callback-return
divChartTableContainer.map((i, element) => {
  list[i] = {
    rank: $(element).find('span#rank').text().replace(/\s/g, ''),
    singer: $(element).find('span.artistName').text(),
    title: $(element).find('div#entity-title').text().replace(/\s/g, ''),
  };
});
console.log(list);
