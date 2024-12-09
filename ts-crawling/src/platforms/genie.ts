/* eslint-disable @typescript-eslint/ban-ts-comment */
import type{
  Element,
} from 'node_modules/.pnpm/domhandler@5.0.3/node_modules/domhandler/lib/esm/index.d.ts';

/* eslint-disable class-methods-use-this */
import * as cheerio from 'cheerio';
import _ from 'lodash';
import {
  calculateWeekOfMonth,
  // createAllDatesBetween,
  createMonthlyFirstDatesBetween, createWeeklyDatesBetween, extractYearMonthDay,
} from '../util/time';
import extractKeyword from '../util/regex';
import { getHtml } from '../util/fetch';
import winLogger from '../logger/winston';
import { checkFetchAddInfoOfArtist, checkFetchAddInfoOfTrack, validateChartDetails } from '../util/typeChecker';
import type {
  ChartDetail, WeeklyChartScope, MonthlyChartScope,
  FetchWeeklyChartResult,
  FetchMonthlyChartResult,
  Artist,
} from '../types/fetch';
import type { PlatformModule } from '../types/platform';
import type { ChartType } from '..//types/common';

type GenieChartType = 'W' |'M'

const ERRORS = {
  CHART_DA: 'The Genie daily chart is available starting from March 28, 2012.',
  CHART_WE: 'The Genie weekly chart is available starting from March 25, 2012.',
  CHART_MO: 'The Genie monthly chart is available starting from February 1, 2012.',
  MAX_CHUNK: 'max 30',
  CHECK_CHART_TYPE: 'check chartType',
};

const minDateWE = new Date('2012-03-25').getTime();
const minDateMO = new Date('2012-02-01').getTime();

function validateDateAvailability(year:string, month:string, day:string, chartType:GenieChartType) {
  const inputDate = new Date(`${year}-${month}-${day}`).getTime();
  if (chartType === 'W' && inputDate < minDateWE) {
    throw new Error(ERRORS.CHART_WE);
  }
  if (chartType === 'M' && inputDate < minDateMO) {
    throw new Error(ERRORS.CHART_MO);
  }
}

function determineChartScope(
  year: string,
  month: string,
  day: string,
  chartType: GenieChartType,
): WeeklyChartScope | MonthlyChartScope {
  if (chartType === 'W') {
    const startDate = new Date(`${year}-${month}-${day}`);
    const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000); // 6일 더해 일주일 범위 계산
    const weekOfMonth = calculateWeekOfMonth(startDate, endDate);
    return {
      chartType: 'w',
      startDate,
      endDate,
      weekOfMonth,
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (chartType === 'M') {
    const date = new Date(`${year}-${month}-${day}`);
    return {
      chartType: 'm',
      date,
    };
  }

  throw new Error('Invalid chartType');
}

function standardizeChartType(chartType:ChartType) {
  if (chartType === 'w') return 'W';
  if (chartType === 'm') return 'M';
  throw Error('chart type is able only \'d\'|\'w\'|\'m\'');
}

export class Genie implements PlatformModule {
  readonly platformName = 'genie';

  async fetchLyricsWithLogin(trackID:string) {
    const GENIE_COOKIES = [
      // check developer tools
    ].join('; ');
    const option = {
      headers: {
        Cookie: GENIE_COOKIES,
      },
    };
    const url = `https://www.genie.co.kr/detail/songInfo?xgnm=${trackID}`;
    const html = await getHtml(url, option);
    const $ = cheerio.load(html);
    const lyrics = $('pre#pLyrics p').text().trim() || 'inst';
    return { lyrics };
  }

  private hasGroupedArtistID(bodyList: cheerio.Cheerio<Element>, $: cheerio.CheerioAPI): boolean {
    return bodyList.toArray().some((element) => {
      const artistNames = $(element).find('a.artist.ellipsis').text().split('&')
        .map((item) => item.trim());
      return artistNames.length > 1;
    });
  }

  private extractCommonData($: cheerio.CheerioAPI, element: Element): Omit<ChartDetail, 'artists'> {
    const rank = $(element).find('td.number').text().match(/\d+/)?.[0] || '';
    const titleName = $(element).find('td.info a.title')
      .children('span.icon-19')
      .remove()
      .end()
      .text()
      .trim();
    const trackID = $(element).attr('songid') || '';
    const titleKeyword = extractKeyword(titleName) as string;
    const albumID = $(element).find('td a.cover span.mask').attr('onclick')?.match(/\d+/)?.[0] || '';

    return {
      rank, titleName, titleKeyword, trackID, albumID,
    };
  }

  private makeChartDetailsSync(bodyList: cheerio.Cheerio<Element>, $: cheerio.CheerioAPI):ChartDetail[] {
    const chartDetails = bodyList.map((_i, element) => {
      const {
        rank, titleName, titleKeyword, trackID, albumID,
      } = this.extractCommonData($, element);

      const artistNames = $(element).find('a.artist.ellipsis').text().split('&')
        .map((item) => item.trim());
      // @ts-ignore
      const artistID = $(element).find('a.artist.ellipsis').attr('onclick').toString()
        .match(/fnViewArtist\('(\d+)'\)/)[1] as string;
      const artists = [{ artistName: artistNames[0] as string, artistID }];

      return {
        rank, titleName, titleKeyword, trackID, artists, albumID,
      };
    }).get();

    validateChartDetails(chartDetails);
    return chartDetails;
  }

  private async makeChartDetails(bodyList: cheerio.Cheerio<Element>, $: cheerio.CheerioAPI):Promise<ChartDetail[]> {
    const chartDetailsMap = bodyList.map(async (_i, element) => {
      const {
        rank, titleName, titleKeyword, trackID, albumID,
      } = this.extractCommonData($, element);

      const artistNames = $(element).find('a.artist.ellipsis').text().split('&')
        .map((item) => item.trim());

      if (artistNames.length === 0) {
        winLogger.error('check', {
          rank, titleName, titleKeyword, trackID, albumID,
        });
      }
      const artistKeywords = extractKeyword(artistNames) as string[];
      // @ts-ignore

      const groupedArtistID:string = $(element).find('a.artist.ellipsis').attr('onclick').toString()
        .match(/fnViewArtist\('(\d+)'\)/)[1] as string;

      if (artistNames.length > 1) {
        const artists = await this.fetchIndividualArtistIDs(groupedArtistID);
        return {
          rank, titleName, titleKeyword, trackID, albumID, artists,
        };
      }

      return {
        rank, titleName, titleKeyword, trackID, albumID, artists: [{ artistName: artistNames[0], artistID: groupedArtistID, artistKeyword: artistKeywords[0] }],
      };
    }).get();
    const chartDetails = await Promise.all(chartDetailsMap);
    validateChartDetails(chartDetails);
    return chartDetails;
  }

  async fetchIndividualArtistIDs(groupedArtistID:string):Promise<Artist[]> {
    const url = `https://www.genie.co.kr/detail/artistInfo?xxnm=${groupedArtistID}`;
    const html = await getHtml(url);
    const $ = cheerio.load(html);
    const artists: Artist[] = [];
    $('div.artist-member-list ul li').each((_, element) => {
      const artistName = $(element).find('.name').text().trim();
      const artistID = $(element).find('a').attr('onclick')?.match(/\d+/)?.[0] || '';
      const artistKeyword = extractKeyword(artistName) as string;

      if (artistID && artistName) {
        artists.push({
          artistName,
          artistKeyword,
          artistID,
        });
      }
    });

    if (artists.length === 0) {
      // winLogger.warn('No artists found for groupedArtistID:', { groupedArtistID, artists });
      const artistName = $('.info-zone h2').text().trim();
      artists.push({
        artistName,
        artistKeyword: extractKeyword(artistName) as string,
        artistID: groupedArtistID,
      });
    }
    return artists;
  }

  /**
    - The Genie Daily Chart starts from March 28, 2012.
    - The Genie Weekly Chart has been in place since March 25, 2012,
    with Mondays as the reference point.
    - The Genie Monthly Chart has been active since February 1, 2012,
    using the first of the month as the starting points
  */
  public async fetchChart(year:string, month:string, day:string, chartType:ChartType) {
    const validateChartType = standardizeChartType(chartType);
    validateDateAvailability(year, month, day, validateChartType);
    const chartScope = determineChartScope(year, month, day, validateChartType);
    const urls = [
      `https://www.genie.co.kr/chart/top200?ditc=${validateChartType}&ymd=${year}${month}${day}&hh=20&rtm=N&pg=1`,
      `https://www.genie.co.kr/chart/top200?ditc=${validateChartType}&ymd=${year}${month}${day}&hh=20&rtm=N&pg=2`,
    ];
    const htmlContents = await Promise.all(urls.map((url) => getHtml(url)));
    const combinedHtml = htmlContents.join(' ');
    const $ = cheerio.load(combinedHtml);
    const bodyList = $('tr.list');
    const hasGroupedArtistID = this.hasGroupedArtistID(bodyList, $);

    const chartDetails = hasGroupedArtistID ? await this.makeChartDetails(bodyList, $) : this.makeChartDetailsSync(bodyList, $);

    const result = {
      chartDetails: chartDetails.filter((item) => item.titleName),
      chartScope,
      platform: this.platformName,
    } as FetchWeeklyChartResult | FetchMonthlyChartResult;
    return result;
  }

  /**
  - The Genie Weekly Chart has been in place since March 25, 2012,
   with Mondays as the reference point.
  - The Genie Weekly Chart has been in place since March 25, 2012,
   with Mondays as the reference point.
  - The Genie Monthly Chart has been active since February 1, 2012,
   using the first of the month as the starting points
    */
  async fetchChartsInParallel(startDate:Date, endDate:Date, chartType:ChartType, chunkSize = 10) {
    const copiedStartDate = new Date(startDate);
    const copiedEndDate = new Date(endDate);
    if (chunkSize > 31) {
      throw Error('max 30');
    }
    let dates;
    if (chartType === 'w') {
      dates = createWeeklyDatesBetween(copiedStartDate, copiedEndDate, 1);
    } else if (chartType === 'm') {
      dates = createMonthlyFirstDatesBetween(copiedStartDate, copiedEndDate);
    } else {
      throw Error('check chartType');
    }

    const dateChunks = _.chunk(dates, chunkSize);
    const result = await Promise.all(
      dateChunks.map(async (chunk) => {
        const chunkResults = await Promise.all(
          chunk.map((date) => {
            const { year, month, day } = extractYearMonthDay(date);
            return this.fetchChart(year, month, day, chartType).catch(
              (err: unknown) => {
                winLogger.error({
                  err, year, month, day, chartType,
                });
                return []; // 에러 발생 시 빈 배열 반환
              },
            );
          }),
        );
        return chunkResults.flat();
      }),
    );
    if (chartType === 'w') {
      return result.flat() as FetchWeeklyChartResult[];
    }
    return result.flat() as FetchMonthlyChartResult[];
  }

  async fetchAddInfoOfTrack(trackID: string, albumID: string) {
    const url = `https://www.genie.co.kr/detail/albumInfo?axnm=${albumID}`;
    const url2 = `https://www.genie.co.kr/detail/songInfo?xgnm=${trackID}`;
    const [html, html2] = await Promise.all([getHtml(url), getHtml(url2)]);
    const $ = cheerio.load(html);
    const $2 = cheerio.load(html2);
    const lyrics = $2('pre#pLyrics p').text().trim() || 'missing';
    const releaseDate = $('.info-data li')
      // eslint-disable-next-line func-names
      .filter(function () {
        return $(this).find('img').attr('alt') === '발매일';
      }).find('.value').text()
      .trim()
      .split('.')
      .join('-') || 'missing'; // "2022.01.01" -> "2022-01-01"

    // 트랙 이미지를 처리
    let trackImage = $('div.album-detail-infos img').attr('src') || 'missing' as string;
    if (trackImage && !trackImage.startsWith('https:')) {
      trackImage = `https:${trackImage}`;
    }

    const fields = {
      trackID,
      lyrics,
      trackImage,
      releaseDate,
      url,
    };
    checkFetchAddInfoOfTrack(fields, this.platformName);
    return { releaseDate, trackImage, lyrics };
  }

  async fetchAddInfoOfArtist(artistID:string) {
    const url = `https://www.genie.co.kr/detail/artistInfo?xxnm=${artistID}`;
    const html = await getHtml(url);
    const $ = cheerio.load(html);

    let artistImage = $('div.photo-zone a').attr('href')?.trim() || 'missing';
    if (artistImage !== 'missing' && !artistImage.startsWith('https:')) {
      artistImage = `https:${artistImage}`;
    }
    // eslint-disable-next-line func-names
    const debutInfo = $('li').filter(function () {
      return $(this).find('img').attr('alt') === '데뷔';
    }).find('span.value').text()
      .trim();

    const debutMatch = debutInfo.match(/\d{4}/);
    const debut = debutMatch ? debutMatch[0] : 'missing';

    const fields = {
      artistImage,
      debut,
      url,
      artistID,
    };
    checkFetchAddInfoOfArtist(fields, this.platformName);
    return { artistImage, debut };
  }
}

export default new Genie();
