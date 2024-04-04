import * as cheerio from 'cheerio';

import { getHtml } from './utils.js';

try {
  const melonURL = 'https://www.melon.com/chart/index.htm?dayTime=2024040214';
  const melonHtml = await getHtml(melonURL);
  const $ = cheerio.load(melonHtml);
  const songSelectors = $('tr.lst50, tr.lst100');
  const songs = songSelectors.map((_i, element) => {
    const rank = $(element).find('span.rank').text().trim();
    const title = $(element).find('div.ellipsis.rank01').text().trim();
    const artist = $(element).find('div.ellipsis.rank02 span.checkEllipsis').text().trim();
    return { rank, title, artist };
  }).get(); // .get()을 사용하여 Cheerio 객체를 일반 배열로 변환

  console.log(songs);
} catch (error) {
  console.error(`An error occurred: ${error.message}`);
}
