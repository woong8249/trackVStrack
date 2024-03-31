import * as cheerio from 'cheerio';

const getHtml = async () => {
  try {
    // 요청할 URL 정의
    const url = 'https://www.genie.co.kr/chart/top200';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const bodyList = $('tr.list');
    const ulList = bodyList.map((i, element) => ({
      rank: i + 1,
      title: $(element).find('td.info a.title').text().trim(),
      artist: $(element).find('td.info a.artist').text().trim(),
    })).get();

    console.log('Chart List:', ulList);
  } catch (error) {
    console.error('Error occurred:', error);
  }
};

getHtml();
