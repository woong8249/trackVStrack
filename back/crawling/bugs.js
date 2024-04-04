import * as cheerio from 'cheerio';

import { getHtml } from './utils.js';

const url = 'https://music.bugs.co.kr/chart';
try {
  const bugsHtml = await getHtml(url);
  const $ = cheerio.load(bugsHtml);
  const list = $('tr');
  const ulList = list.map((_i, element) => ({
    rank: $(element).find('div.ranking').find('strong').text(),
    title: $(element).find('p.title').text().trim(),
    artist: $(element).find('p.artist').text().trim(),
  })).get();
  console.log('Chart List:', ulList);
} catch (err) {
  console.log(err);
}
// '이브, 프시케 그리고 푸른 수염의 아내
