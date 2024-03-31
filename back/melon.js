import * as cheerio from 'cheerio';

const getHtml = async () => {
  try {
    const url = 'https://www.melon.com/chart/index.htm';
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Error fetching ${url}: ${response.statusText}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const songSelectors = $('tr.lst50, tr.lst100');
    const songs = songSelectors.map((_i, element) => {
      const rank = $(element).find('span.rank').text().trim();
      const title = $(element).find('div.ellipsis.rank01').text().trim();
      const singer = $(element).find('div.ellipsis.rank02 span.checkEllipsis').text().trim();

      return { rank, title, singer };
    }).get(); // .get()을 사용하여 Cheerio 객체를 일반 배열로 변환

    console.log(songs);
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
  }
};

getHtml();
