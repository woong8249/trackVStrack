/* eslint-disable no-restricted-syntax */
import * as cheerio from 'cheerio';

import { createAllDatesBetween, createMonthlyFirstDatesBetween, createWeeklyDatesBetween } from './util.js';
import { getHtml } from './utils.js';

/**
 * @param {number} year
 * @param {number} month
 * @param {number} day
  * @param {'D' | 'W' | 'M'} chartType - default is D
  */
async function fetchChart(year, month, day, chartType = 'D') {
  const urls = [
    `https://www.genie.co.kr/chart/top200?ditc=${chartType}&ymd=${year}${month}${day}&hh=20&rtm=N&pg=1`,
    `https://www.genie.co.kr/chart/top200?ditc=${chartType}&ymd=${year}${month}${day}&hh=20&rtm=N&pg=2`,
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
}

/**
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {'D' | 'W' | 'M'} chartType - default is D
 * @param {number} chunkSize - default is 10, max30
  */
async function fetchChartsForDateRangeInParallel(startDate, endDate, chartType, chunkSize = 10) {
  if (chunkSize > 31) {
    throw Error('max 30');
  }
  let dates;
  if (chartType === 'D') {
    dates = createAllDatesBetween(startDate, endDate);
  } else if (chartType === 'W') {
    dates = createWeeklyDatesBetween(startDate, endDate);
  } else if (chartType === 'M') {
    dates = createMonthlyFirstDatesBetween(startDate, endDate);
  } else {
    throw Error('check chartType');
  }

  const dateChunks = [];
  for (let i = 0; i < dates.length; i += chunkSize) {
    dateChunks.push(dates.slice(i, i + chunkSize));
  }
  for (const chunk of dateChunks) {
    const promises = chunk.map(date => {
      const year = date.getFullYear();
      const month = (`0${date.getMonth() + 1}`).slice(-2);
      const day = (`0${date.getDate()}`).slice(-2);

      return fetchChart(year, month, day);
    });

    // eslint-disable-next-line no-await-in-loop
    await Promise.all(promises);
    console.log(`Finished fetching ${chunk.length} charts`);
  }
}

fetchChartsForDateRangeInParallel(new Date(2024, 2, 1), new Date(2024, 3, 1), 'M', 10);
fetchChartsForDateRangeInParallel(new Date(2024, 2, 1), new Date(2024, 3, 1), 'W', 10);
fetchChartsForDateRangeInParallel(new Date(2024, 2, 1), new Date(2024, 3, 1), 'D', 10);
