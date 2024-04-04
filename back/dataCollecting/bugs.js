/* eslint-disable no-restricted-syntax */
import * as cheerio from 'cheerio';

import { getHtml } from '../crawling/utils.js';

import { createAllDatesBetween, createWeeklyDatesBetween } from './util.js';

/**
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @param {'day' | 'week' } chartType - default is day
  */
async function fetchChart(year, month, day, chartType = 'day') {
  const url = `https://music.bugs.co.kr/chart/track/${chartType}/total?chartdate=${year}${month}${day}`;
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
}
/**
 #### week chart consideration
 - `금` 기준
    - `2003.08.29 ~ 2003.09.04` 시작
    - `2010.11.05 ~ 2010.11.11` 마지막
- `월` 기준
    - `2010.11.08 ~ 2010.11.1` 시작
        - endpoint 20101112  ⇒ `2010.11.08 ~ 2010.11.1`
    - `2012.08.06 ~ 2012.08.12` 마지막
- `화` 기준
    - `2012.08.07 ~ 2012.08.13` 시작
        - endpoint 20120813  ⇒ `2010.11.08 ~ 2010.11.1`
    - `2014.07.29 ~ 2014.08.04` 마지막

- `월` 기준
    - `2014.08.04 ~ 2014.08.10` 시작
        - endpoint  20140805 ⇒`2014.08.04 ~ 2014.08.10`
    - continue
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {'day' | 'week' } chartType - default is day
 * @param {number} chunkSize - default is 10, max30
  */
async function fetchChartsForDateRangeInParallel(startDate, endDate, chartType, chunkSize = 10) {
  if (chunkSize > 31) {
    throw Error('max 30');
  }
  let dates;
  if (chartType === 'day') {
    dates = createAllDatesBetween(startDate, endDate);
  } else if (chartType === 'week') {
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

fetchChartsForDateRangeInParallel(new Date(2024, 2, 1), new Date(2024, 3, 1), 'week', 10);
fetchChartsForDateRangeInParallel(new Date(2024, 2, 1), new Date(2024, 3, 1), 'day', 10);
