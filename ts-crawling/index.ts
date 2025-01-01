/* eslint-disable no-await-in-loop */
import { validateCommand, validateDate } from './src/util/typeChecker';
import { fetchWeeklyCharts } from './src/service/fetchChart';
import fs from 'fs';
import path from 'path';
import type { TrackFormatWithAddInfo, TrackFormatWithoutAddInfo } from './src/types/processing';
import type { PlatformName } from './src/types/common';
import { insertAllTrackSAndArtists, insertTrackSAndArtists } from './src/service/insert';
import { findAllJsonFilePaths } from './src/util/json';
import config from './src/config/config';
import { uploadFileToS3 } from './src/s3/uploadFileToS3';
const { env } = config.app as {env:'development.local' | 'production.docker'};

const command = validateCommand(process.argv[2]);

switch (command) {
  case 'fetch': {
    const startDate = validateDate(process.argv[3]);
    const endDate = validateDate(process.argv[4]);
    const startDateString = (startDate.toISOString().split('T')[0] as string).split('-').join('');
    const endDateString = (endDate.toISOString().split('T')[0] as string).split('-').join('');
    const prefix = `data/${startDateString}-${endDateString}-w`;
    const dirPath = path.join(__dirname, prefix);
    const results = await fetchWeeklyCharts(startDate, endDate);
    for (let i = 0; i < results.length; i += 1) {
      const platformName = Object.keys((results[i] as TrackFormatWithAddInfo[])[0] as unknown as TrackFormatWithoutAddInfo).find((key) => key !== 'trackKeyword') as PlatformName;
      const fileName = `${platformName}.json`;
      if (env.includes('development')) {
        fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(path.join(dirPath, fileName), JSON.stringify(results[i]));
      }
      await uploadFileToS3({ Key: path.join(prefix, fileName), Body: JSON.stringify(results[i]) });
    }
    break;
  }

  case 'insert': {
    const startDate = validateDate(process.argv[3]);
    const endDate = validateDate(process.argv[4]);
    const startDateString = (startDate.toISOString().split('T')[0] as string).split('-').join('');
    const endDateString = (endDate.toISOString().split('T')[0] as string).split('-').join('');
    const dirPath = path.join(__dirname, `data/${startDateString}-${endDateString}-w`);
    const tracksData = findAllJsonFilePaths(dirPath).map((filePath) => {
      const data = fs.readFileSync(filePath, 'utf8');
      return (JSON.parse(data) as TrackFormatWithAddInfo[]);
    }).flat();
    await insertTrackSAndArtists(tracksData, tracksData.length, { count: 0 });
    break;
  }

  case 'insertAll': {
    await insertAllTrackSAndArtists();
    break;
  }

  default:
    break;
}
