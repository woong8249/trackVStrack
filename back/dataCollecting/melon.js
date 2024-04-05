/* eslint-disable no-restricted-syntax */
import * as cheerio from 'cheerio';

import {
  addSixDaysToYYYYMMDD, arrayToChunk,
  createMonthlyFirstDatesBetween, createWeeklyDatesBetween, extractYearMonthDay, getHtml,
} from './util.js';

/**
- The Melon weekly chart has been available since January 3, 2010.
- The Melon monthly chart has been available since January 1, 2010.
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @param { 'WE' | 'MO'} chartType - default is MO
  */
export async function fetchChart(year, month, day, chartType = 'MO') {
  if (chartType === 'WE' && new Date(`${year}-${month}-${day}`).getTime() < new Date('2010-01-03').getTime()) {
    throw Error('The Melon weekly chart has been available since January 3, 2010.');
  } else if (chartType === 'MO' && new Date(`${year}-${month}-${day}`).getTime() < new Date('2010-01-01').getTime()) {
    throw Error('The Melon monthly chart has been available since January 1, 2010');
  }

  const age = Math.floor(year / 10) * 10;
  const startDay = String(year) + String(month) + String(day);
  const endDay = addSixDaysToYYYYMMDD(startDay);
  const chartDateRange = { chartType };

  if (chartType === 'WE') {
    const startDate = new Date(`${year}-${month}-${day}`);
    const endDate = { ...startDate }.setDate(startDate.getDate() + 6);
    Object.assign(chartDateRange, { startDate, endDate });
  }
  if (chartType === 'MO') {
    Object.assign(chartDateRange, { date: new Date(`${year}-${month}-${day}`) });
  }
  const url = `https://www.melon.com/chart/search/list.htm?chartType=${chartType}&age=${age}&year=${year}&mon=${month}&day=${startDay}^${endDay}&classCd=DP0000&startDay=${startDay}&endDay=${endDay}&moved=Y`;
  const options = {
    method: 'GET',
    headers: {
      Accept: 'text/html,*/*;q=0.8',
      Cookie: 'PCID=17121918065252841818955; PC_PCID=17121918065252841818955; _fwb=242U7bhDvKHCzBdbaLyYjGl.1712191806875; wcs_bt=s_f9c4bde066b:1712191806; __T_=1; POC=MP10; _T_ANO=FczVMLYpX+DwN1lq1jEO0+DZjC1nWqjRRUwlx+zCTW1eQEWKWp7dWs/9MCj03lUJo3IL6Q+HHGK3irQr0GNjYHnqN2K2xxKbVSrJ6TVhHqBV+Ka4j2Nws9pWY+BMv85a1I69LYp8ZABqzh11YA5JkFA+yKM2Yaf6332wJVJvXAKDL4hiThgFf5OcsXvzKgNYvHZZr2O53QpW6Kac3rl2eJVbSoNNs+EnupNzgJOecMmtla1mA70l1Tl+KdfSQ7+ZTFt+VTJjiPBA9FHvhrYMNbO1vxPMdJ+luqKpkeUI/NGTznjJXhzz31pDCYfropNqY4mpBAKLKd4z00519SQeKg==',
    },
  };
  const melonHtml = await getHtml(url, options);
  const $ = cheerio.load(melonHtml);
  const songSelectors = $('tr.lst50, tr.lst100');
  const chartDetails = songSelectors.map((_i, element) => {
    const rank = $(element).find('span.rank').text().trim();
    const title = $(element).find('div.ellipsis.rank01').text().replace(/\s+/g, ' ')
      .trim();
    const artist = $(element).find('div.ellipsis.rank02 span.checkEllipsis').text().trim();
    return { rank, title, artist };
  }).get(); //
  return { chartDetails, chartDateRange };
}

/**
- The Melon weekly chart has been available since January 3, 2010.
- The Melon monthly chart has been available since January 1, 2010.
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {'MO'|'WE'} chartType
 * @param {number} chunkSize - default =10, max=30
 */
export async function fetchChartsForDateRangeInParallel(
  startDate, endDate, chartType, chunkSize = 10,
) {
  if (chunkSize > 31) {
    throw Error('max 30');
  }

  let dates;
  if (chartType === 'MO') {
    dates = createMonthlyFirstDatesBetween(startDate, endDate);
    console.log(dates);
  } else if (chartType === 'WE' && startDate.getTime() < new Date('2012-08-11').getTime()) {
    dates = createWeeklyDatesBetween(startDate, endDate, 0);
  } else if (chartType === 'WE') {
    dates = createWeeklyDatesBetween(startDate, endDate, 1);
  } else {
    throw Error('check chartType');
  }
  const result = [];
  const dateChunks = arrayToChunk(dates, chunkSize);
  for (const chunk of dateChunks) {
    const promises = chunk.map(date => {
      const { year, month, day } = extractYearMonthDay(date);
      return fetchChart(year, month, day, chartType);
    });
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(promises).then(re => result.push(...re));
  }
  return result;
}
