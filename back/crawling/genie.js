import * as cheerio from 'cheerio';

import { getHtml } from './utils.js';
const urls = [
  'https://genie.co.kr/chart/top200?ditc=D&ymd=20240402&hh=15&rtm=Y&pg=1',
  'https://genie.co.kr/chart/top200?ditc=D&ymd=20240402&hh=15&rtm=Y&pg=2',
];

try {
  const htmlContents = await Promise.all(urls.map(url => getHtml(url)));
  const combinedHtml = htmlContents.join(' ');
  const $ = cheerio.load(combinedHtml);
  const bodyList = $('tr.list');
  const ulList = bodyList.map((_i, element) => ({
    rank: $(element).find('td.number').text().match(/\d+/)[0],
    title: $(element).find('td.info a.title').text().trim(),
    artist: $(element).find('td.info a.artist').text().trim(),
  })).get();
  console.log('Chart List:', ulList);
} catch (err) {
  console.error('Error occurred:', err);
}

// '이브, 프시케 그리고 푸른 수염의 아내',
// '이브, 프시케 그리고 푸른 수염의 아내',
// { rank: '72', title: '심(心)', singer: 'DK(디셈버)' },
