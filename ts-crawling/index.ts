import { validateCommand, validateDate } from './src/util/typeChecker';
import { fetchWeeklyCharts } from './src/service/fetchChart';
import fs from 'fs';
import path from 'path';
import type { TrackFormatWithAddInfo, TrackFormatWithoutAddInfo } from './src/types/processing';
import type { PlatformName } from './src/types/common';
import { insertAllTrackSAndArtists, insertTrackSAndArtists } from './src/service/insert';
import { findAllJsonFilePaths } from './src/util/json';

const command = validateCommand(process.argv[2]);

switch (command) {
  case 'fetch': {
    const startDate = validateDate(process.argv[3]);
    const endDate = validateDate(process.argv[4]);
    const startDateString = (startDate.toISOString().split('T')[0] as string).split('-').join('');
    const endDateString = (endDate.toISOString().split('T')[0] as string).split('-').join('');
    const dirPath = path.join(__dirname, `data/${startDateString}-${endDateString}-w`);
    const results = await fetchWeeklyCharts(startDate, endDate);
    fs.mkdirSync(dirPath, { recursive: true });
    results.forEach((result) => {
      const platformName = Object.keys(result[0] as unknown as TrackFormatWithoutAddInfo).find((key) => key !== 'trackKeyword') as PlatformName;
      const fileName = `${platformName}.json`;
      fs.writeFileSync(path.join(dirPath, fileName), JSON.stringify(result));
    });
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
