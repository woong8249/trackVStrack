import * as Cheerio from 'cheerio';
import puppeteer from 'puppeteer';

// URL을 인자로 받아 해당 페이지의 HTML을 반환하는 함수
async function fetchPageContent(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  const content = await page.content();
  await browser.close();
  return content;
}

// 주어진 URL의 웹 페이지로부터 데이터를 추출하여 출력하는 함수
async function extractDataFromPage(url) {
  try {
    const html = await fetchPageContent(url);
    const $ = Cheerio.load(html);
    const divChartTableContainer = $('ytmc-entry-row');
    const list = divChartTableContainer.map((i, element) => ({
      rank: $(element).find('span#rank').text().trim(),
      singer: $(element).find('span.artistName').text().trim(), // 가수 이름에서는 띄어쓰기를 유지
      title: $(element).find('div#entity-title').text().trim(),
    })).get(); // Cheerio의 map 사용 후 get()으로 배열로 변환

    console.log(list);
  } catch (error) {
    console.error(`Error fetching data: ${error.message}`);
  }
}

// 실행 함수 호출
const url = 'https://charts.youtube.com/charts/TopSongs/kr/weekly';
extractDataFromPage(url);

// { rank: '1', singer: '(G)I-DLE', title: 'Fate' },
//   { rank: '2', singer: 'TWS', title: 'plot twist' },
//   { rank: '3', singer: 'LE SSERAFIM', title: 'EASY' },
//   { rank: '4', singer: 'LE SSERAFIM', title: 'Smart' },
//   { rank: '5', singer: 'Creepy Nuts', title: 'Bling-Bang-Bang-Born' },
//   { rank: '6', singer: 'BIBI', title: '밤양갱' },
