import * as cheerio from 'cheerio';

const getHtml = async () => {
  try {
    // 1
    const html = await fetch('https://www.genie.co.kr/chart/top200').then(response => response.ok && response.text());
    const ulList = [];
    const $ = cheerio.load(html);
    const bodyList = $('tr.list');
    // eslint-disable-next-line array-callback-return
    bodyList.map((i, element) => {
      ulList[i] = {
        rank: i + 1,
        title: $(element).find('td.info a.title').text().replace(/\s/g, ''),
        artist: $(element).find('td.info a.artist').text().replace(/\s/g, ''),
      };
    });
    // console.log('bodyList : ', ulList);
  } catch (error) {
    console.error(error);
  }
};

getHtml();
