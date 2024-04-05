/* eslint-disable no-restricted-syntax */
import * as cheerio from 'cheerio';

import {
  arrayToChunk, createAllDatesBetween,
  createMonthlyFirstDatesBetween, createWeeklyDatesBetween, extractYearMonthDay, getHtml,
} from './util.js';

/**
- The Genie Daily Chart starts from March 28, 2012.
- The Genie Weekly Chart has been in place since March 25, 2012,
 with Mondays as the reference point.
- The Genie Monthly Chart has been active since February 1, 2012,
 using the first of the month as the starting points
 * @param {number} year
 * @param {number} month
 * @param {number} day
  * @param {'D' | 'W' | 'M'} chartType - default is D
  */
export async function fetchChart(year, month, day, chartType = 'D') {
  if (chartType === 'D' && new Date(year, month, day).getTime() < new Date('2012-03-28')) {
    throw Error('The Genie Daily Chart starts from March 28, 2012.');
  } else if (chartType === 'W' && new Date(year, month, day).getTime() < new Date('2012-03-25')) {
    throw Error('The Genie Weekly Chart has been in place since March 25, 2012');
  } else if (chartType === 'M' && new Date(year, month, day).getTime() < new Date('2012-02-01')) {
    throw Error('The Genie Monthly Chart has been active since February 1, 2012');
  }
  const chartDateRange = { chartType };
  if (chartType === 'D') {
    Object.assign(chartDateRange, { date: new Date(year, month, day) });
  }
  if (chartType === 'W') {
    const startDate = new Date(year, month, day);
    Object.assign(chartDateRange,
      { startDate, endDate: startDate.setDate(startDate.getDate() + 6) });
  }
  if (chartType === 'M') {
    Object.assign(chartDateRange, { date: new Date(year, month, day) });
  }
  const urls = [
    `https://www.genie.co.kr/chart/top200?ditc=${chartType}&ymd=${year}${month}${day}&hh=20&rtm=N&pg=1`,
    `https://www.genie.co.kr/chart/top200?ditc=${chartType}&ymd=${year}${month}${day}&hh=20&rtm=N&pg=2`,
  ];
  const htmlContents = await Promise.all(urls.map(url => getHtml(url)));
  const combinedHtml = htmlContents.join(' ');
  const $ = cheerio.load(combinedHtml);
  const bodyList = $('tr.list');
  const chartDetails = bodyList.map((_i, element) => ({
    rank: $(element).find('td.number').text().match(/\d+/)[0],
    title: $(element).find('td.info a.title').text().trim(),
    artist: $(element).find('td.info a.artist').text().trim(),
  })).get();
  return { chartDetails, chartDateRange };
}

/**
- The Genie Weekly Chart has been in place since March 25, 2012,
 with Mondays as the reference point.
- The Genie Weekly Chart has been in place since March 25, 2012,
 with Mondays as the reference point.
- The Genie Monthly Chart has been active since February 1, 2012,
 using the first of the month as the starting points
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {'D' | 'W' | 'M'} chartType - default is D
 * @param {number} chunkSize - default is 10, max30
  */
export async function fetchChartsForDateRangeInParallel(
  startDate, endDate, chartType, chunkSize = 10,
) {
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
  const result = [];
  const dateChunks = arrayToChunk(dates, chunkSize);
  for (const chunk of dateChunks) {
    const promises = chunk.map(date => {
      const { year, month, day } = extractYearMonthDay(date);
      return fetchChart(year, month, day);
    });
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(promises);
  }
  return result;
}
