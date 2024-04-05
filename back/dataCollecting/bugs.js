/* eslint-disable no-restricted-syntax */
import * as cheerio from 'cheerio';

import { getHtml } from '../crawling/utils.js';

import {
  arrayToChunk, createAllDatesBetween,
  createWeeklyDatesBetween, extractYearMonthDay,
} from './util.js';
/**
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @param {'day' | 'week' } chartType - default is day
  */
export async function fetchChart(year, month, day, chartType = 'day') {
  const url = `https://music.bugs.co.kr/chart/track/${chartType}/total?chartdate=${year}${month}${day}`;
  if (chartType === 'day' && new Date(year, month, day).getTime() < new Date('2006-09-22').getTime()) {
    throw Error('Bugs daily chart has been available since September 22, 2006');
  } else if (chartType === 'week' && new Date(year, month, day).getTime() < new Date('2003-08-29').getTime()) {
    throw Error('Bugs weekly chart has been available since August 29, 2003');
  }
  const chartDateRange = { chartType };
  if (chartType === 'day') {
    Object.assign(chartDateRange, { date: new Date(year, month, day) });
  }
  if (chartType === 'week') {
    const startDate = new Date(year, month, day);
    Object.assign(chartDateRange,
      { startDate, endDate: startDate.setDate(startDate.getDate() + 6) });
  }
  const bugsHtml = await getHtml(url);
  const $ = cheerio.load(bugsHtml);
  const list = $('tr');
  const chartDetails = list.map((_i, element) => ({
    rank: $(element).find('div.ranking').find('strong').text(),
    title: $(element).find('p.title').text().trim(),
    artist: $(element).find('p.artist').text().trim(),
  })).get();
  return { chartDetails, chartDateRange };
}
/**
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {'day' | 'week' } chartType - default is day
 * @param {number} chunkSize - default is 10, max30
  */
export async function fetchChartsForDateRangeInParallel(
  startDate, endDate, chartType, chunkSize = 10,
) {
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
  const result = [];
  const dateChunks = arrayToChunk(dates, chunkSize);
  for (const chunk of dateChunks) {
    const promises = chunk.map(date => {
      const { year, month, day } = extractYearMonthDay(date);
      return fetchChart(year, month, day).catch(console.log);
    });
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(promises).then(re => result.push(...re));
  }
  return result;
}
