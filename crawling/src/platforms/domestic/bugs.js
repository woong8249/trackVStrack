/* eslint-disable prefer-destructuring */
/* eslint-disable func-names */
/* eslint-disable no-useless-escape */
/* eslint-disable newline-per-chained-call */
import * as cheerio from 'cheerio';

import {
  calculateWeekOfMonth, createAllDatesBetween, createWeeklyDatesBetween,
  extractYearMonthDay,
} from '../../util/time.js';
import { arrayToChunk } from '../../util/array.js';
import extractKeyword from '../../util/regex.js';
import { getHtml } from '../../util/fetch.js';
import winLogger from '../../util/winston.js';

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

async function makeChartDetails(url) {
  const bugsHtml = await getHtml(url);
  const $ = cheerio.load(bugsHtml);
  const list = $('tr');
  const chartDetails = list.map((_i, element) => {
    const rank = $(element).find('div.ranking strong').text().trim();
    const artistName = $(element).find('p.artist a').length === 1
      ? $(element).find('p.artist').text().trim()
      : $(element).find('p.artist').find('a').eq(0).text().trim();
    const artistID = $(element).find('p.artist a').length === 1
      ? $(element).find('p.artist a').attr('href')?.match(/artist\/(\d+)/)[1]
      : $(element).find('p.artist a').eq(0).attr('href')?.match(/artist\/(\d+)/)[1];
    const title = $(element).find('p.title a').text().trim();
    const thumbnail = $(element).find('a.thumbnail img').attr('src');
    const titleKeyword = extractKeyword(title);
    const albumID = $(element).attr('albumid');
    const trackID = $(element).attr('trackid');
    return {
      rank,
      title,
      titleKeyword,
      artists: [{ artistID, artistName, artistKeyword: extractKeyword(artistName) }],
      albumID,
      trackID,
      thumbnail,
    };
  }).get();
  return chartDetails;
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
  const chartScope = determineChartScope(year, month, day, validateChartType);
  const url = `https://music.bugs.co.kr/chart/track/${validateChartType}/total?chartdate=${year}${month}${day}`;
  const chartDetails = await makeChartDetails(url);
  return { chartDetails: chartDetails.filter(item => item.title), chartScope, platform: 'bugs' };
}

/**
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {'d' | 'w' } chartType - default is day
 * @param {number} chunkSize - default is 10, max30
  */
export async function fetchChartsForDateRangeInParallel(startDate, endDate, chartType, chunkSize = 10) {
  const copiedStartDate = new Date(startDate);
  const copiedEndDate = new Date(endDate);
  if (chunkSize > 31) {
    throw Error('max 30');
  }
  let dates;
  if (chartType === 'd') {
    dates = createAllDatesBetween(copiedStartDate, copiedEndDate);
  } else if (chartType === 'w' && copiedStartDate.getTime() <= new Date('2010-11-10').getTime()) {
    dates = createWeeklyDatesBetween(copiedStartDate, copiedEndDate, 5);
  } else if (chartType === 'w' && copiedStartDate.getTime() <= new Date('2012-08-12').getTime()) {
    dates = createWeeklyDatesBetween(copiedStartDate, copiedEndDate, 1);
  } else if (chartType === 'w' && copiedStartDate.getTime() <= new Date('2014-08-04').getTime()) {
    dates = createWeeklyDatesBetween(copiedStartDate, copiedEndDate, 2);
  } else {
    dates = createWeeklyDatesBetween(copiedStartDate, copiedEndDate, 1);
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

export async function fetchAdditionalInformationOfTrack(trackID, albumID) {
  const url = `https://music.bugs.co.kr/album/${albumID}`;
  const url2 = `https://music.bugs.co.kr/track/${trackID}?wl_ref=list_tr_08_ab`;
  const [html, html2] = await Promise.all([getHtml(url), getHtml(url2)]);
  const $ = cheerio.load(html);
  const $2 = cheerio.load(html2);
  const lyrics = $2('div.lyricsContainer xmp').text().trim();
  let releaseDate = $('table.info th').filter(function () {
    return $(this).text().trim() === '발매일';
  }).next('td').find('time').text().trim();

  const trackImage = $('div.innerContainer img').attr('src');
  releaseDate = new Date(releaseDate.split('.').join('-'));
  return { releaseDate, trackImage, lyrics };
}

export async function fetchRealTimeChart() {
  const url = 'https://music.bugs.co.kr/chart/track/realtime/total';
  const chartDetails = await makeChartDetails(url);
  return chartDetails;
}

export async function fetchArtistInfo(artistID) {
  const url = `https://music.bugs.co.kr/artist/${artistID}?wl_ref=list_ar_01_search`;
  const html = await getHtml(url);
  const $ = cheerio.load(html);
  const artistImage = $('li.big img').attr('src') || null;
  const debut = $('tr').filter(function () {
    return $(this).find('th').text() === '데뷔';
  }).find('td').text() || null;

  return { artistImage, debut };
}
