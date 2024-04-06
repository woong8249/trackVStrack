/* eslint-disable no-restricted-syntax */
import * as cheerio from 'cheerio';

import winLogger from '../util/winston.js';

import {
  arrayToChunk, createAllDatesBetween,
  createMonthlyFirstDatesBetween, createWeeklyDatesBetween, extractYearMonthDay, getHtml,
} from './util.js';

const ERRORS = {
  CHART_DA: 'The Genie daily chart is available starting from March 28, 2012.',
  CHART_WE: 'The Genie weekly chart is available starting from March 25, 2012.',
  CHART_MO: 'The Genie monthly chart is available starting from February 1, 2012.',
  MAX_CHUNK: 'max 30',
  CHECK_CHART_TYPE: 'check chartType',
};

const minDateDA = new Date('2012-03-28').getTime();
const minDateWE = new Date('2012-03-25').getTime();
const minDateMO = new Date('2012-02-01').getTime();

function validateDateAvailability(year, month, day, chartType) {
  const inputDate = new Date(`${year}-${month}-${day}`).getTime();
  if (chartType === 'D' && inputDate < minDateDA) {
    throw new Error(ERRORS.CHART_DA);
  }
  if (chartType === 'W' && inputDate < minDateWE) {
    throw new Error(ERRORS.CHART_WE);
  }
  if (chartType === 'M' && inputDate < minDateMO) {
    throw new Error(ERRORS.CHART_MO);
  }
}

function determineChartScope(year, month, day, chartType = 'D') {
  const chartScope = { chartType };
  if (chartType === 'D') {
    Object.assign(chartScope, { date: new Date(`${year}-${month}-${day}`) });
  }
  if (chartType === 'W') {
    const startDate = new Date(`${year}-${month}-${day}`);
    Object.assign(chartScope, { startDate, endDate: new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000) });
  }
  if (chartType === 'M') {
    Object.assign(chartScope, { date: new Date(`${year}-${month}-${day}`) });
  }
  return chartScope;
}

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
  validateDateAvailability(year, month, day, chartType);
  const chartScope = determineChartScope(year, month, day, chartType);
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
  return { chartDetails, chartScope };
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
export async function fetchChartsForDateRangeInParallel(startDate, endDate, chartType, chunkSize = 10) {
  if (chunkSize > 31) {
    throw Error('max 30');
  }
  let dates;
  if (chartType === 'D') {
    dates = createAllDatesBetween(startDate, endDate);
  } else if (chartType === 'W') {
    dates = createWeeklyDatesBetween(startDate, endDate, 1);
  } else if (chartType === 'M') {
    dates = createMonthlyFirstDatesBetween(startDate, endDate);
  } else {
    throw Error('check chartType');
  }
  const dateChunks = arrayToChunk(dates, chunkSize);

  const result = await Promise.all(dateChunks.map(async chunk => {
    const chunkResults = await Promise.all(chunk.map(date => {
      const { year, month, day } = extractYearMonthDay(date);
      return fetchChart(year, month, day, chartType).catch(err => winLogger.error(err));
    }));
    return chunkResults.flat();
  }));

  return result.flat();
}
