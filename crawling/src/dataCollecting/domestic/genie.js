/* eslint-disable no-useless-escape */
/* eslint-disable no-restricted-syntax */
import * as cheerio from 'cheerio';

import {
  arrayToChunk, calculateWeekOfMonth, createAllDatesBetween,
  createMonthlyFirstDatesBetween, createWeeklyDatesBetween, extractYearMonthDay,
} from '../../util/time.js';
import extractKeyword from '../../util/regex.js';
import { getHtml } from '../../util/fetch.js';
import winLogger from '../../util/winston.js';

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

function determineChartScope(year, month, day, chartType) {
  const chartScope = { chartType };
  if (chartType === 'D') {
    chartScope.chartType = 'd';
    Object.assign(chartScope, { date: new Date(`${year}-${month}-${day}`) });
  }
  if (chartType === 'W') {
    chartScope.chartType = 'w';
    const startDate = new Date(`${year}-${month}-${day}`);
    Object.assign(chartScope, {
      startDate,
      endDate: new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000),
      weekOfMonth: calculateWeekOfMonth(new Date(`${year}-${month}-${day}`), new Date(new Date(`${year}-${month}-${day}`).getTime() + (6 * 24 * 60 * 60 * 1000))),
    });
  }
  if (chartType === 'M') {
    chartScope.chartType = 'm';
    Object.assign(chartScope, { date: new Date(`${year}-${month}-${day}`) });
  }
  return chartScope;
}

function standardizeChartType(chartType) {
  if (chartType === 'd')
    return 'D';
  if (chartType === 'w')
    return 'W';
  if (chartType === 'm')
    return 'M';
  throw Error('chart type is able only \'d\'|\'w\'|\'m\'');
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
  * @param {'d' | 'w' | 'm'} chartType
  */
export async function fetchChart(year, month, day, chartType) {
  const validateChartType = standardizeChartType(chartType);
  validateDateAvailability(year, month, day, validateChartType);
  const chartScope = determineChartScope(year, month, day, validateChartType);
  const urls = [
    `https://www.genie.co.kr/chart/top200?ditc=${validateChartType}&ymd=${year}${month}${day}&hh=20&rtm=N&pg=1`,
    `https://www.genie.co.kr/chart/top200?ditc=${validateChartType}&ymd=${year}${month}${day}&hh=20&rtm=N&pg=2`,
  ];
  const htmlContents = await Promise.all(urls.map(url => getHtml(url)));
  const combinedHtml = htmlContents.join(' ');
  const $ = cheerio.load(combinedHtml);
  const bodyList = $('tr.list');
  const chartDetails = bodyList.map((_i, element) => {
    const rank = $(element).find('td.number').text().match(/\d+/)[0];
    const title = $(element).find('td.info a.title')
      .children('span.icon-19')
      .remove()
      .end() // '19금' 텍스트를 포함하는 span 제거
      .text()
      .trim();
    const artistID = $(element).find('a.artist.ellipsis').attr('onclick').toString()
      .match(/fnViewArtist\('(\d+)'\)/)[1];
    let artists = $(element).find('td.info a.artist').text().split('&');
    if (artists.length === 1) {
      artists = artists.map(item => ({ artistName: item.trim(), artistKeyword: extractKeyword(item), artistID }));
    } else {
      artists = artists.map(item => ({ artistName: item.trim(), artistKeyword: extractKeyword(item), artistID: null }));
    }
    const titleKeyword = extractKeyword(title);
    const albumID = $(element).find('td a.cover span.mask').attr('onclick').match(/\d+/)[0];
    const trackID = $(element).attr('songid');
    const thumbnail = 'https:' + $(element).find('a.cover img').attr('src');

    return {
      rank, title, titleKeyword, artists, albumID, trackID, thumbnail,
    };
  }).get();
  return { chartDetails: chartDetails.filter(item => item.title), chartScope, platform: 'genie' };
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
 * @param {'d' | 'w' | 'm'} chartType
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
  } else if (chartType === 'w') {
    dates = createWeeklyDatesBetween(copiedStartDate, copiedEndDate, 1);
  } else if (chartType === 'm') {
    dates = createMonthlyFirstDatesBetween(copiedStartDate, copiedEndDate);
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

export async function fetchAdditionalInformationOfTrack(trackID, albumID) {
  const url = `https://www.genie.co.kr/detail/albumInfo?axnm=${albumID}`;
  const url2 = `https://www.genie.co.kr/detail/songInfo?xgnm=${trackID}`;
  const [html, html2] = await Promise.all([getHtml(url), getHtml(url2)]);
  const $ = cheerio.load(html);
  const $2 = cheerio.load(html2);
  const lyrics = $2('pre#pLyrics p').text().trim();
  // eslint-disable-next-line func-names
  let releaseDate = $('.info-data li').filter(function () {
    return $(this).find('img').attr('alt') === '발매일';
  }).find('.value').text()
    .trim();
  releaseDate = new Date(releaseDate.split('.').join('-'));
  let trackImage = $('div.album-detail-infos img').attr('src');
  if (!trackImage.startsWith('https:')) {
    trackImage = 'https:' + trackImage;
  }
  return { releaseDate, trackImage, lyrics };
}
