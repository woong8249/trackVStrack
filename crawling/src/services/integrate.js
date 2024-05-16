/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import path from 'path';

import {
  decideKeyNameOfArtists,
  decideKeyNameOfTrack,
  integrateTracks,
  mappingTrackBeforeIntegrate,
} from '../integrate/domestic/integrate.js';
import { extractYearMonthDay, formatDates } from '../util/time';
import flushAllRedisData from '../redis/flushAllRedisData.js';
import { removeDuplicates } from '../util/array.js';
import verifiedTrack from '../integrate/domestic/verifiedTracks.json';
import winLogger from '../util/winston';

export default async function integrateFiles(startDate, endDate, chartType) {
  const fileNameToRead = Object.values(extractYearMonthDay(startDate)).reduce((pre, cur) => pre + cur, '')
    + '-' + Object.values(extractYearMonthDay(endDate)).reduce((pre, cur) => pre + cur, '') + '-' + chartType;
  const filePathToRead = path.join(__dirname, '../integrate/domestic/dataBeforeIntegration', `${fileNameToRead}.json`);
  const tracks = JSON.parse(fs.readFileSync(filePathToRead));
  const mappingTrack = mappingTrackBeforeIntegrate(tracks);
  const step1 = [];
  const step2 = [];
  const step3 = [];
  for await (const track of mappingTrack) {
    const da1 = await decideKeyNameOfArtists(track);
    step1.push(da1);
  }
  // 로직상 두번
  for await (const track of step1) {
    const dt = await decideKeyNameOfArtists(track);
    step2.push(dt);
  }

  for await (const track of step2) {
    const dt = await decideKeyNameOfTrack(track);
    step3.push(dt);
  }
  const result = integrateTracks(step2);
  const trackWithSubFixOverZeroNotVerified = [];
  Object.entries(result).forEach(([key, value]) => {
    const subFix = key.split('/')[2];

    if (subFix > 0 && !verifiedTrack.includes(key)) {
      trackWithSubFixOverZeroNotVerified.push(key);
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

  const trackWithSubFixOverZeroNotVerifiedNoDuplicate = removeDuplicates(trackWithSubFixOverZeroNotVerified);
  const filePath = path.join(__dirname, '../integrate/domestic', `${fileNameToWrite}-notVerified.json`);
  trackWithSubFixOverZeroNotVerifiedNoDuplicate.length && fs.writeFileSync(filePath, JSON.stringify(trackWithSubFixOverZeroNotVerifiedNoDuplicate));
  trackWithSubFixOverZeroNotVerifiedNoDuplicate.length && winLogger.info('check notVerified tracks.', { filePath });

  const filePathToWrite = path.join(__dirname, '../integrate/domestic/dataAfterIntegration', `${fileNameToWrite}.json`);
  fs.writeFileSync(filePathToWrite, JSON.stringify(result));
  return result;
}

export async function integrateAllFile() {
  await flushAllRedisData();
  const dirPath = path.join(__dirname, '../integrate/domestic/dataBeforeIntegration');
  const days = fs.readdirSync(dirPath).map(item => formatDates(item));

  for await (const day of days) {
    const startDate = new Date(day[0]);
    const endDate = new Date(day[1]);
    await integrateFiles(startDate, endDate, 'w');
    winLogger.info('integrate done.', { startDate, endDate });
  }
  winLogger.info('integrate all done.');
  await flushAllRedisData();
}
