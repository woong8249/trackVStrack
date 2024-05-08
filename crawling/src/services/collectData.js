/* eslint-disable no-restricted-syntax */
/* eslint-disable no-shadow */

import fs from 'fs';
import path from 'path';

import * as bugs from '../dataCollecting/domestic/bugs.js';
import * as genie from '../dataCollecting/domestic/genie.js';
import * as melon from '../dataCollecting/domestic/melon.js';
import {
  addAdditionalInfoToTracks,
  classifyTracks,
  decideKeyNameOfArtists,
  decideKeyNameOfTrack,
  integrateTracks,
  mappingChartDataToTrack,
  mappingTrackBeforeIntegrate,
} from '../dataCollecting/domestic/integrate';
import { extractYearMonthDay } from '../util/time';
import winLogger from '../util/winston';

const modules = { melon, bugs, genie };

// --------------------------------------------------------------------------------------------------------------------------------
//  step 1: crawlingDomesticPlatformCharts
export async function crawlingDomesticPlatformCharts(startDate, endDate, chartType) {
  const fileName = Object.values(extractYearMonthDay(startDate)).reduce((pre, cur) => pre + cur, '')
   + '-' + Object.values(extractYearMonthDay(endDate)).reduce((pre, cur) => pre + cur, '') + '-' + chartType;
  const filePath = path.join(__dirname, '../dataCollecting/domestic', '/dataBeforeIntegration', `${fileName}.json`);

  const startTimeCrawling = new Date();
  winLogger.info('Start chart crawling and classification', { startDate, endDate, chartType });
  const firstCrawlingPromises = Object.entries(modules)
    .map(([key, value]) => value.fetchChartsForDateRangeInParallel(startDate, endDate, chartType)
      .then(async result => {
        const classifiedTracks = classifyTracks(await mappingChartDataToTrack(result), key);
        winLogger.debug(`Number of tracks on ${key} platform`, { numberOfTracks: Object.keys(classifiedTracks).length });
        return classifiedTracks;
      }));
  const [melon, bugs, genie] = await Promise.all(firstCrawlingPromises);
  const endTimeCrawling = new Date();
  winLogger.info('End chart crawling and classification');
  winLogger.info(`Chart crawling and classification took ${(endTimeCrawling - startTimeCrawling) / 1000} seconds`);

  const startTimeAdditionalInfo = new Date();
  winLogger.info('Start crawling additional track information');
  const addInfoCrawlingPromises = Object.entries({ melon, bugs, genie })
    .map(([key, value]) => addAdditionalInfoToTracks(value, key));
  const result = await Promise.all(addInfoCrawlingPromises);
  const endTimeAdditionalInfo = new Date();
  winLogger.info('End crawling additional track information');
  winLogger.info(`Crawling additional track information took ${(endTimeAdditionalInfo - startTimeAdditionalInfo) / 1000} seconds`);
  fs.writeFileSync(filePath, JSON.stringify(result));
  return result;
}

// --------------------------------------------------------------------------------------------------------
//  step 2: integrateAllDomesticTracks
export async function integrateAllDomesticTracks(startDate, endDate, chartType) {
  const fileNameToRead = Object.values(extractYearMonthDay(startDate)).reduce((pre, cur) => pre + cur, '')
  + '-' + Object.values(extractYearMonthDay(endDate)).reduce((pre, cur) => pre + cur, '') + '-' + chartType;
  const filePathToRead = path.join(__dirname, '../dataCollecting/domestic', '/dataBeforeIntegration', `${fileNameToRead}.json`);
  const tracks = JSON.parse(fs.readFileSync(filePathToRead));
  const mappingTrack = mappingTrackBeforeIntegrate(tracks);
  const step1 = [];
  const step2 = [];
  const step3 = [];

  // 로직상 두사이클 돌려야함
  for await (const track of mappingTrack) {
    const _track = await decideKeyNameOfArtists(track);
    step1.push(_track);
  }
  for await (const track of step1) {
    const _track = await decideKeyNameOfArtists(track);
    step2.push(_track);
  }
  for await (const track of step2) {
    const _track = await decideKeyNameOfTrack(track);
    step3.push(_track);
  }
  const result = integrateTracks(step3);
  Object.entries(result).forEach(([key, value]) => {
    if (key.split('/')[2] > 0) {
      winLogger.warn('SubFix of trackKey is over zero.', { trackKey: key });
    }
    const { artists } = value;
    artists.forEach(artist => {
      if (artist.artistKey.split('/')[2] > 0) {
        winLogger.warn('SubFix of artistKey is over zero', { artistKey: artist.artistKey });
      }
    });
  });
  const fileNameToWrite = Object.values(extractYearMonthDay(startDate)).reduce((pre, cur) => pre + cur, '')
  + '-' + Object.values(extractYearMonthDay(endDate)).reduce((pre, cur) => pre + cur, '') + '-' + chartType;
  const filePathToWrite = path.join(__dirname, '../dataCollecting/domestic', '/dataAfterIntegration', `${fileNameToWrite}.json`);
  fs.writeFileSync(filePathToWrite, JSON.stringify(result));
  return result;
}
