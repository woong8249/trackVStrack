/* eslint-disable no-restricted-syntax */
import * as cheerio from 'cheerio';

import {
  addSixDaysToYYYYMMDD, createMonthlyFirstDatesBetween, createWeeklyDatesBetween, getHtml,
} from './util.js';

/**
 * @param {number} year
 * @param {number} month
 * @param {number} day
  * @param { 'WE' | 'MO'} chartType - default is MO
  */
async function fetchChart(year, month, day, chartType = 'MO') {
  const age = Math.floor(year / 10) * 10;
  const startDay = String(year) + String(month) + String(day);
  const endDay = addSixDaysToYYYYMMDD(startDay);
  try {
    const url = `https://www.melon.com/chart/search/list.htm?chartType=${chartType}&age=${age}&year=${year}&mon=${month}&day=${startDay}^${endDay}&classCd=DP0000&startDay=${startDay}&endDay=${endDay}&moved=Y`;
    const options = {
      method: 'GET',
      headers: {
        Accept: 'text/html,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      },
    };
    const melonHtml = await getHtml(url, options);
    console.log(melonHtml);
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
}

async function fetchChartsForDateRangeInParallel(startDate, endDate, chartType, chunkSize = 10) {
  if (chunkSize > 31) {
    throw Error('max 30');
  }
  let dates;
  if (chartType === 'MO') {
    dates = createMonthlyFirstDatesBetween(startDate, endDate);
  } else if (chartType === 'WE') {
    dates = createWeeklyDatesBetween(startDate, endDate);
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

fetchChartsForDateRangeInParallel(new Date(2024, 2, 1), new Date(2024, 3, 1), 'WE', 10);
// fetchChartsForDateRangeInParallel(new Date(2024, 2, 1), new Date(2024, 3, 1), 'MO', 10);
