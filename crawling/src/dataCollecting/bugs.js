/* eslint-disable no-useless-escape */
/* eslint-disable newline-per-chained-call */
import * as cheerio from 'cheerio';

import {
  arrayToChunk, calculateWeekOfMonth, createAllDatesBetween, createWeeklyDatesBetween,
  extractYearMonthDay,
} from '../util/time.js';
import { getHtml } from '../util/fetch.js';

const ERRORS = {
  CHART_DA: 'The Bugs daily chart has been available since September 22, 2006.',
  CHART_WE: 'The Bugs weekly chart has been available since August 29, 2003.',
  MAX_CHUNK: 'max 30',
  CHECK_CHART_TYPE: 'check chartType',
};
const minDateDA = new Date('2006-03-22').getTime();
const minDateWE = new Date('2003-08-29').getTime();

/**
 * @param { 'd' | 'w'} chartType - default is MO
  */
function standardizeChartType(chartType) {
  if (chartType === 'd')
    return 'day';
  if (chartType === 'w')
    return 'week';
  throw Error('chart type is able only \'d\'|\'w\'');
}

function validateDateAvailability(year, month, day, chartType) {
  const able = ['week', 'day'];
  if (!able.find(ite => ite === chartType)) {
    throw new Error(ERRORS.CHECK_CHART_TYPE);
  }

  const inputDate = new Date(`${year}-${month}-${day}`).getTime();
  if (chartType === 'day' && inputDate < minDateDA) {
    throw new Error(ERRORS.CHART_DA);
  }
  if (chartType === 'week' && inputDate < minDateWE) {
    throw new Error(ERRORS.CHART_WE);
  }
}

function determineChartScope(year, month, day, chartType) {
  const chartScope = { chartType };
  if (chartType === 'day') {
    chartScope.chartType = 'd';
    Object.assign(chartScope, { date: new Date(`${year}-${month}-${day}`) });
  }
  if (chartType === 'week') {
    chartScope.chartType = 'w';
    const startDate = new Date(`${year}-${month}-${day}`);
    Object.assign(chartScope, {
      startDate,
      endDate: new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000),
      weekOfMonth: calculateWeekOfMonth(new Date(`${year}-${month}-${day}`), new Date(new Date(`${year}-${month}-${day}`).getTime() + (6 * 24 * 60 * 60 * 1000))),
    });
  }
  return chartScope;
}

/**
 * @param {string} year
 * @param {string} month
 * @param {string} day
 * @param {'d' | 'w' } chartType - default is day
  */
export async function fetchChart(year, month, day, chartType) {
  const validateChartType = standardizeChartType(chartType);
  validateDateAvailability(year, month, day, validateChartType);
  const url = `https://music.bugs.co.kr/chart/track/${validateChartType}/total?chartdate=${year}${month}${day}`;
  const chartScope = determineChartScope(year, month, day, validateChartType);
  const bugsHtml = await getHtml(url);
  const $ = cheerio.load(bugsHtml);
  const list = $('tr');
  const chartDetails = list.map((_i, element) => {
    const rank = $(element).find('div.ranking strong').text().trim();
    const artist = $(element).find('p.artist a').length === 1
      ? $(element).find('p.artist').text().trim()
      : $(element).find('p.artist').find('a').eq(0).text().trim();
    const title = $(element).find('p.title a').text().trim();
    // const detailObject = extractBracketsAndNormalize(rank, title, artist);
    // return detailObject;

    const keyword = title.replace(/\s*[\(\[-].*$/, '');
    const albumID = $(element).attr('albumid');

    return {
      rank, title, artist, keyword, albumID,
    };
  }).get();

  return { chartDetails: chartDetails.filter(item => item.title), chartScope, platform: 'bugs' };
}

/**
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {'d' | 'w' } chartType - default is day
 * @param {number} chunkSize - default is 10, max30
  */
export async function fetchChartsForDateRangeInParallel(startDate, endDate, chartType, chunkSize = 10) {
  if (chunkSize > 31) {
    throw Error('max 30');
  }
  let dates;
  if (chartType === 'd') {
    dates = createAllDatesBetween(startDate, endDate);
  } else if (chartType === 'w' && startDate.getTime() <= new Date('2010-11-10').getTime()) {
    dates = createWeeklyDatesBetween(startDate, endDate, 5);
  } else if (chartType === 'w' && startDate.getTime() <= new Date('2012-08-12').getTime()) {
    dates = createWeeklyDatesBetween(startDate, endDate, 1);
  } else if (chartType === 'w' && startDate.getTime() <= new Date('2014-08-04').getTime()) {
    dates = createWeeklyDatesBetween(startDate, endDate, 2);
  } else {
    dates = createWeeklyDatesBetween(startDate, endDate, 1);
  }
  const dateChunks = arrayToChunk(dates, chunkSize);

  const result = await Promise.all(dateChunks.map(async chunk => {
    const chunkResults = await Promise.all(chunk.map(date => {
      const { year, month, day } = extractYearMonthDay(date);
      return fetchChart(year, month, day, chartType).catch(err => console.error(err));
    }));
    return chunkResults.flat();
  }));

  return result.flat();
}

export async function fetchReleaseDate(albumID) {
  const url = `https://music.bugs.co.kr/album/${albumID}`;
  const html = await getHtml(url);
  const $ = cheerio.load(html);
  // eslint-disable-next-line func-names
  const releaseDate = $('table.info th').filter(function () {
    return $(this).text().trim() === '발매일';
  }).next('td').find('time').text().trim();

  return releaseDate;
}
