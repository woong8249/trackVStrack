/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
import * as cheerio from 'cheerio';

import {
  addSixDaysToYYYYMMDD, arrayToChunk, calculateWeekOfMonth,
  createMonthlyFirstDatesBetween, createWeeklyDatesBetween, extractYearMonthDay,
} from '../util/time.js';
import { getHtml } from '../util/fetch.js';
import winLogger from '../util/winston.js';

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

/**
 * @param { 'm' | 'w'} chartType - default is MO
  */
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
  // const chartDetails = normalization($, songSelectors);
  const chartDetails = songSelectors.map((_i, element) => {
    const rank = $(element).find('span.rank').text().match(/\d+/)[0];
    const title = $(element).find('div.ellipsis.rank01').text().trim();
    const artist = $(element).find('div.ellipsis.rank02 span.checkEllipsis').text().trim();
    const detailObject = normalization(rank, title, artist);
    return detailObject;
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
  if (chunkSize > 31) {
    throw Error('max 30');
  }

  const dates = generateDatesForChartType(startDate, endDate, chartType);
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
