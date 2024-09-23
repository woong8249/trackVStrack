/* eslint-disable class-methods-use-this */
import * as cheerio from 'cheerio';

import {
  calculateWeekOfMonth, createAllDatesBetween, createWeeklyDatesBetween,
  extractYearMonthDay,
} from '../util/time';
import _ from 'lodash';
import type {
  ChartDetail, WeeklyChartScope, ChartType,
  FetchWeeklyChartResult,
  PlatformModule,
  FetchDailyChartResult,
  DailyChartScope,
  Artist,
  // Artist,
} from 'src/types/platform';

import extractKeyword from '../util/regex';
import { getHtml } from '../util/fetch';
import winLogger from '../logger/winston';

import { validateChartDetails } from '../util/typeChecker';

type BugsChartType = 'week' |'day'

const ERRORS = {
  CHART_DA: 'The Bugs daily chart has been available since September 22, 2006.',
  CHART_WE: 'The Bugs weekly chart has been available since August 29, 2003.',
  MAX_CHUNK: 'max 30',
  CHECK_CHART_TYPE: 'check chartType',
};
const minDateDA = new Date('2006-03-22').getTime();
const minDateWE = new Date('2003-08-29').getTime();

function standardizeChartType(chartType:ChartType):BugsChartType {
  if (chartType === 'd') return 'day';
  if (chartType === 'w') return 'week';
  throw Error('chart type is able only \'d\'|\'w\'');
}

function validateDateAvailability(year:string, month:string, day:string, bugsChartType:BugsChartType) {
  const able = ['week', 'day'];
  if (!able.find((ite) => ite === bugsChartType)) {
    throw new Error(ERRORS.CHECK_CHART_TYPE);
  }

  const inputDate = new Date(`${year}-${month}-${day}`).getTime();
  if (bugsChartType === 'day' && inputDate < minDateDA) {
    throw new Error(ERRORS.CHART_DA);
  }
  if (bugsChartType === 'week' && inputDate < minDateWE) {
    throw new Error(ERRORS.CHART_WE);
  }
}

function determineChartScope(year:string, month:string, day:string, chartType:BugsChartType):WeeklyChartScope|FetchDailyChartResult {
  const chartScope = {} as WeeklyChartScope|FetchDailyChartResult;
  if (chartType === 'day') {
    Object.assign(chartScope, { date: new Date(`${year}-${month}-${day}`), chartType: 'd' });
  }
  if (chartType === 'week') {
    const startDate = new Date(`${year}-${month}-${day}`);
    Object.assign(chartScope, {
      chartType: 'w',
      startDate,
      endDate: new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000),
      weekOfMonth: calculateWeekOfMonth(new Date(`${year}-${month}-${day}`), new Date(new Date(`${year}-${month}-${day}`).getTime() + (6 * 24 * 60 * 60 * 1000))),
    });
  }
  return chartScope;
}

export class Bugs implements PlatformModule {
  public readonly platformName = 'bugs';

  private makeChartDetails(htmlContents: string): ChartDetail[] {
    const $ = cheerio.load(htmlContents);
    const list = $('tr');

    const chartDetailsPromises = list.map((_i, element) => {
      const rank = $(element).find('div.ranking strong').text().trim();
      const title = $(element).find('p.title a').text().trim();
      const titleKeyword = extractKeyword(title);
      const albumID = $(element).attr('albumid');
      const trackID = $(element).attr('trackid');

      let artists:Artist[] = [];
      const multiArtist = $(element).attr('multiartist') === 'Y';
      if (multiArtist) {
        const artistOnClickData = $(element).find('a[name="atag_martist_list"]').attr('onclick');
        if (artistOnClickData) {
          const artistDataPattern = /'([^']+)'/;
          const artistDataMatch = artistOnClickData.match(artistDataPattern);
          if (artistDataMatch && artistDataMatch[1]) {
            artists = artistDataMatch[1].split('OK').filter((item) => item).map((item) => {
              const ar = item.split('||');
              return { artistName: ar[1] as string, artistID: ar[2] as string, artistKeyword: extractKeyword(ar[1] as string) as string };
            });
          }
        }
      } else {
        // 단수 아티스트인 경우
        const artistName = $(element).find('p.artist a').text().trim();
        const artistID = $(element).find('p.artist a').attr('href')?.match(/artist\/(\d+)/)?.[1];

        if (artistName && artistID) {
          artists = [{ artistName, artistID, artistKeyword: extractKeyword(artistName) as string }];
        }
      }
      return {
        rank,
        title,
        titleKeyword,
        artists,
        albumID,
        trackID,
      };
    }).get();

    const chartDetails = (chartDetailsPromises).filter((chartD) => chartD.title);

    // 유효성 검사
    validateChartDetails(chartDetails);
    return chartDetails;
  }

  async fetchChart(year:string, month:string, day:string, chartType:ChartType) : Promise<FetchDailyChartResult | FetchWeeklyChartResult> {
    const validateChartType = standardizeChartType(chartType);
    validateDateAvailability(year, month, day, validateChartType);
    const chartScope = determineChartScope(year, month, day, validateChartType);
    const url = `https://music.bugs.co.kr/chart/track/${validateChartType}/total?chartdate=${year}${month}${day}`;
    // console.log(url);
    const melonHtml = await getHtml(url);
    const chartDetails = this.makeChartDetails(melonHtml);
    if (validateChartType === 'week') {
      return {
        chartDetails: chartDetails.filter((item) => item.title),
        chartScope: chartScope as WeeklyChartScope, // 타입 단언
        platform: 'bugs',
      };
    }
    return {
      chartDetails: chartDetails.filter((item) => item.title),
      chartScope: chartScope as unknown as DailyChartScope, // 타입 단언
      platform: 'bugs',
    };
  }

  async fetchChartsInParallel(startDate:Date, endDate:Date, chartType:ChartType, chunkSize = 10):Promise<FetchWeeklyChartResult[] | FetchDailyChartResult[]> {
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
    const dateChunks = _.chunk(dates, chunkSize);

    const result = await Promise.all(dateChunks.map(async (chunk) => {
      const chunkResults = await Promise.all(chunk.map((date) => {
        const { year, month, day } = extractYearMonthDay(date);
        return this.fetchChart(year, month, day, chartType).catch((err: unknown) => {
          winLogger.error({
            err, year, month, day, chartType,
          });
          return [];
        });
      }));
      return chunkResults.flat();
    }));

    if (chartType === 'w') {
      return result.flat() as FetchWeeklyChartResult[];
    }

    return result.flat() as FetchDailyChartResult[];
  }

  async fetchAddInfoOfTrack(trackID:string, albumID:string) {
    const url = `https://music.bugs.co.kr/album/${albumID}`;
    const url2 = `https://music.bugs.co.kr/track/${trackID}?wl_ref=list_tr_08_ab`;
    const [html, html2] = await Promise.all([getHtml(url), getHtml(url2)]);
    const $ = cheerio.load(html);
    const $2 = cheerio.load(html2);
    const lyrics = $2('div.lyricsContainer xmp').text().trim();

    const trackImage = $('div.innerContainer img').attr('src') as string;
    // eslint-disable-next-line func-names
    const releaseDate = new Date($('table.info th').filter(function () {
      return $(this).text().trim() === '발매일';
    }).next('td').find('time')
      .text()
      .trim()
      .split('.')
      .join('-'));
    return { releaseDate, trackImage, lyrics };
  }

  async fetchAddInfoOArtist(artistID:string) {
    const url = `https://music.bugs.co.kr/artist/${artistID}?wl_ref=list_ar_01_search`;
    const html = await getHtml(url);
    const $ = cheerio.load(html);
    const artistImage = $('li.big img').attr('src') as string;
    // eslint-disable-next-line func-names
    const debut = $('tr').filter(function () {
      return $(this).find('th').text() === '데뷔';
    }).find('td').text() || 'missing';

    if (!artistImage || !debut) {
      const missingFields = {
        artistImage,
        debut,
      };

      winLogger.warn('Missing required artist information', {
        artistID,
        ...missingFields,
      });
      throw new Error(`Fail extract artist information from artistID ${artistID}`);
    }
    return { artistImage, debut };
  }
}

export default new Bugs();

// export async function fetchRealTimeChart() {
//   const url = 'https://music.bugs.co.kr/chart/track/realtime/total';
//   const chartDetails = await makeChartDetails(url);
//   return chartDetails;
// }
