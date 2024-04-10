/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
import * as cheerio from 'cheerio';

import {
  arrayToChunk, calculateWeekOfMonth, createAllDatesBetween,
  createMonthlyFirstDatesBetween, createWeeklyDatesBetween, extractYearMonthDay,
} from '../util/time.js';
import { getHtml } from '../util/fetch.js';
import winLogger from '../util/winston.js';

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

function extractAndRemoveBrackets(str) {
  const bracketContent = [];
  let resultStr = str;
  let lastIndex = 0;
  let depth = 0;
  for (let i = 0; i < str.length; i += 1) {
    if (str[i] === '(') {
      depth += 1;
      if (depth === 1)
        lastIndex = i; // 첫 괄호 시작 인덱스
    } else if (str[i] === ')') {
      depth -= 1;
      if (depth === 0) {
        // 가장 바깥쪽 괄호 내용 추출
        bracketContent.push(str.substring(lastIndex + 1, i));
        resultStr = resultStr.substring(0, lastIndex) + resultStr.substring(i + 1);
        i = lastIndex;
      }
    }
  }
  return { content: bracketContent, text: resultStr.trim() };
}

function normalization(rank, title, artist) {
  const additionalInformation = {};
  title = title.replace(/19금\s*/g, '');
  // title과 artist의 괄호 처리
  const titleResult = extractAndRemoveBrackets(title);
  const artistResult = extractAndRemoveBrackets(artist);
  // 추출된 괄호 내용이 있으면 additionalInformation에 추가
  if (titleResult.content.length)
    additionalInformation.title = titleResult.content;
  if (artistResult.content.length)
    additionalInformation.artist = artistResult.content;
  title = titleResult.text;
  artist = artistResult.text;
  const detailObject = { rank, title, artist };
  // 추가 정보가 있을 경우만 객체에 추가
  if (Object.keys(additionalInformation).length) {
    detailObject.additionalInformation = additionalInformation;
  }
  return detailObject;
}

/**
 * @param { 'd' | 'w'| 'm'} chartType - default is MO
  */
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
    const title = $(element).find('td.info a.title').text().trim();
    const artist = $(element).find('td.info a.artist').text().trim();
    const detailObject = normalization(rank, title, artist);
    return detailObject;
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
  if (chunkSize > 31) {
    throw Error('max 30');
  }
  let dates;
  if (chartType === 'd') {
    dates = createAllDatesBetween(startDate, endDate);
  } else if (chartType === 'w') {
    dates = createWeeklyDatesBetween(startDate, endDate, 1);
  } else if (chartType === 'm') {
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
