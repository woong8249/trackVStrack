/* eslint-disable newline-per-chained-call */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
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
    const artist = $(element).find('p.artist').find('a').length === 1
      ? $(element).find('p.artist').text().trim()
      : $(element).find('p.artist').find('a').eq(0).text().trim();
    const rank = $(element).find('div.ranking').find('strong').text().trim();
    const title = $(element).find('p.title').text().trim();
    const detailObject = normalization(rank, title, artist);
    return detailObject;
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
