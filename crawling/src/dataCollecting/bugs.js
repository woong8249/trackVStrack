/* eslint-disable no-restricted-syntax */
import * as cheerio from 'cheerio';

import {
  arrayToChunk, createAllDatesBetween, createWeeklyDatesBetween,
  extractYearMonthDay,
} from '../util/time.js';
import { getHtml } from '../util/fetch.js';
import winLogger from '../util/winston.js';

const ERRORS = {
  CHART_DA: 'The Bugs daily chart has been available since September 22, 2006.',
  CHART_WE: 'The Bugs weekly chart has been available since August 29, 2003.',
  MAX_CHUNK: 'max 30',
  CHECK_CHART_TYPE: 'check chartType',
};

const minDateDA = new Date('2006-03-22').getTime();
const minDateWE = new Date('2003-08-29').getTime();

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

function determineChartScope(year, month, day, chartType = 'day') {
  const chartScope = { chartType };
  if (chartType === 'day') {
    Object.assign(chartScope, { date: new Date(`${year}-${month}-${day}`) });
  }
  if (chartType === 'week') {
    const startDate = new Date(`${year}-${month}-${day}`);
    Object.assign(chartScope, { startDate, endDate: new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000) });
  }
  return chartScope;
}

/**
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @param {'day' | 'week' } chartType - default is day
  */
export async function fetchChart(year, month, day, chartType = 'day') {
  validateDateAvailability(year, month, day, chartType);

  const url = `https://music.bugs.co.kr/chart/track/${chartType}/total?chartdate=${year}${month}${day}`;
  const chartScope = determineChartScope(year, month, day, chartType);
  const bugsHtml = await getHtml(url);
  const $ = cheerio.load(bugsHtml);
  const list = $('tr');
  const chartDetails = list.map((_i, element) => ({
    rank: $(element).find('div.ranking').find('strong').text(),
    title: $(element).find('p.title').text().trim(),
    artist: $(element).find('p.artist').text().trim(),
  })).get();
  return { chartDetails, chartScope };
}

/**
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {'day' | 'week' } chartType - default is day
 * @param {number} chunkSize - default is 10, max30
  */
export async function fetchChartsForDateRangeInParallel(startDate, endDate, chartType, chunkSize = 10) {
  if (chunkSize > 31) {
    throw Error('max 30');
  }
  let dates;
  if (chartType === 'day') {
    dates = createAllDatesBetween(startDate, endDate);
  } else if (chartType === 'week' && startDate.getTime() <= new Date('2010-11-10').getTime()) {
    dates = createWeeklyDatesBetween(startDate, endDate, 5);
  } else if (chartType === 'week' && startDate.getTime() <= new Date('2012-08-12').getTime()) {
    dates = createWeeklyDatesBetween(startDate, endDate, 1);
  } else if (chartType === 'week' && startDate.getTime() <= new Date('2014-08-04').getTime()) {
    dates = createWeeklyDatesBetween(startDate, endDate, 2);
  } else {
    dates = createWeeklyDatesBetween(startDate, endDate, 1);
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
