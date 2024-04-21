/* eslint-disable no-useless-escape */
/* eslint-disable max-len */
import * as cheerio from 'cheerio';

import {
  addSixDaysToYYYYMMDD, arrayToChunk, calculateWeekOfMonth,
  createMonthlyFirstDatesBetween, createWeeklyDatesBetween, extractYearMonthDay,
} from '../../util/time.js';
import { getHtml } from '../../util/fetch.js';
import winLogger from '../../util/winston.js';

// import { extractBracketsAndNormalize } from './commonChartUtils.js';

const ERRORS = {
  CHART_WE: 'The Melon weekly chart has been available since January 3, 2010.',
  CHART_MO: 'The Melon monthly chart has been available since January 1, 2010.',
  MAX_CHUNK: 'max 30',
  CHECK_CHART_TYPE: 'check chartType',
};

const options = {
  method: 'GET',
  headers: {
    Accept: 'text/html,*/*;q=0.8',
    Cookie: 'PCID=17121918065252841818955; PC_PCID=17121918065252841818955; _fwb=242U7bhDvKHCzBdbaLyYjGl.1712191806875; wcs_bt=s_f9c4bde066b:1712191806; __T_=1; POC=MP10; _T_ANO=FczVMLYpX+DwN1lq1jEO0+DZjC1nWqjRRUwlx+zCTW1eQEWKWp7dWs/9MCj03lUJo3IL6Q+HHGK3irQr0GNjYHnqN2K2xxKbVSrJ6TVhHqBV+Ka4j2Nws9pWY+BMv85a1I69LYp8ZABqzh11YA5JkFA+yKM2Yaf6332wJVJvXAKDL4hiThgFf5OcsXvzKgNYvHZZr2O53QpW6Kac3rl2eJVbSoNNs+EnupNzgJOecMmtla1mA70l1Tl+KdfSQ7+ZTFt+VTJjiPBA9FHvhrYMNbO1vxPMdJ+luqKpkeUI/NGTznjJXhzz31pDCYfropNqY4mpBAKLKd4z00519SQeKg==',
  },
};

const minDateWE = new Date('2010-01-03').getTime();
const minDateMO = new Date('2010-01-01').getTime();

function standardizeChartType(chartType) {
  if (chartType === 'm')
    return 'MO';
  if (chartType === 'w')
    return 'WE';
  throw Error('chart type is able only \'m\'|\'w\'');
}

function validateDateAvailability(year, month, day, chartType) {
  const inputDate = new Date(`${year}-${month}-${day}`).getTime();
  if (chartType === 'WE' && inputDate < minDateWE)
    throw new Error(ERRORS.CHART_WE);
  if (chartType === 'MO' && inputDate < minDateMO)
    throw new Error(ERRORS.CHART_MO);
}

function generateDatesForChartType(startDate, endDate, chartType) {
  if (chartType === 'm') {
    return createMonthlyFirstDatesBetween(startDate, endDate);
  } if (chartType === 'w') {
    const offset = startDate.getTime() < new Date('2012-08-11').getTime() ? 0 : 1;
    return createWeeklyDatesBetween(startDate, endDate, offset);
  }
  throw new Error('Invalid chart type.');
}

export async function fetchReleaseDateAndImage(trackID) {
  const url = `https://www.melon.com/song/detail.htm?songId=${trackID}`;
  const html = await getHtml(url);
  const $ = cheerio.load(html);
  // eslint-disable-next-line func-names
  let releaseDate = $('dt').filter(function () {
    return $(this).text().trim() === '발매일';
  }).next('dd').text()
    .trim();
  releaseDate = new Date(releaseDate.split('.').join('-'));
  const trackImage = $('div.thumb img').attr('src');
  return { releaseDate, trackImage };
}

/**
- The Melon weekly chart has been available since January 3, 2010.
- The Melon monthly chart has been available since January 1, 2010.
 * @param {string} year - ex) '2023','2024'
 * @param {string} month - ex) '12','8'
 * @param {string} day
 * @param { 'w' | 'm'} chartType - default is MO
  */
export async function fetchChart(year, month, day, chartType) {
  const validateChartType = standardizeChartType(chartType);
  validateDateAvailability(year, month, day, validateChartType);
  const age = Math.floor(year / 10) * 10;
  const startDay = `${year}${month}${day}`;
  const endDay = validateChartType === 'WE' ? addSixDaysToYYYYMMDD(startDay) : startDay;
  const chartScope = {
    chartType,
    ...(validateChartType === 'WE' ? {
      startDate: new Date(`${year}-${month}-${day}`),
      endDate: new Date(new Date(`${year}-${month}-${day}`).getTime() + (6 * 24 * 60 * 60 * 1000)),
      weekOfMonth: calculateWeekOfMonth(new Date(`${year}-${month}-${day}`), new Date(new Date(`${year}-${month}-${day}`).getTime() + (6 * 24 * 60 * 60 * 1000))),
    } : { date: new Date(`${year}-${month}-${day}`) }),
  };

  const url = `https://www.melon.com/chart/search/list.htm?chartType=${validateChartType}&age=${age}&year=${year}&mon=${month}&day=${startDay}^${endDay}&classCd=DP0000&startDay=${startDay}&endDay=${endDay}&moved=Y`;
  const melonHtml = await getHtml(url, options);
  const $ = cheerio.load(melonHtml);
  const songSelectors = $('tr.lst50, tr.lst100');
  const chartDetails = songSelectors.map((_i, element) => {
    const rank = $(element).find('span.rank').text().match(/\d+/)[0];
    const title = $(element).find('div.ellipsis.rank01 strong').text().trim();
    const artists = $(element).find('div.ellipsis.rank02 span.checkEllipsis').text().trim()
      .split(',');
    const trackID = $(element).find('input.input_check').val();
    const thumbnail = $(element).find('img').attr('src');
    const titleKeyword = title.replace(/\s*[\(\[-].*$/, '');
    const artistKeyword = artists[0].replace(/\s*[\(\[-].*$/, '');
    return {
      rank, title, artists, titleKeyword, trackID, thumbnail, artistKeyword,
    };
  }).get();
  return { chartDetails: chartDetails.filter(item => item.title), chartScope, platform: 'melon' };
}

/**
- The Melon weekly chart has been available since January 3, 2010.
- The Melon monthly chart has been available since January 1, 2010.
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {'m'|'w'} chartType
 * @param {number} chunkSize - default =10, max=30
 */
export async function fetchChartsForDateRangeInParallel(startDate, endDate, chartType, chunkSize = 10) {
  const copiedStartDate = new Date(startDate);
  const copiedEndDate = new Date(endDate);
  if (chunkSize > 31) {
    throw Error('max 30');
  }

  const dates = generateDatesForChartType(copiedStartDate, copiedEndDate, chartType);
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
