/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-shadow */
import fs from 'fs';
import path from 'path';

import * as bugs from '../platforms/domestic/bugs.js';
import * as genie from '../platforms/domestic/genie.js';
import * as melon from '../platforms/domestic/melon.js';
import { addAdditionalInfoToTracks, classifyTracks, mappingChartDataToTrack } from '../integrate/domestic/integrate.js';
import { extractYearMonthDay } from '../util/time';
import winLogger from '../util/winston.js';

const modules = { melon, bugs, genie };

export function fetchRealTimeCharts() {
  const charts = Object.entries(modules).map(async module => {
    const [key, value] = module;
    const result = await value.fetchRealTimeChart();
    return { [key]: result };
  });
  return Promise.all(charts);
}

export async function fetchWeeklyCharts(startDate, endDate, chartType = 'w') {
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
  return result;
}

export default async function collectWeeklyCharts(startDate, endDate, chartType) {
  const fileName = Object.values(extractYearMonthDay(startDate)).reduce((pre, cur) => pre + cur, '')
   + '-' + Object.values(extractYearMonthDay(endDate)).reduce((pre, cur) => pre + cur, '') + '-' + chartType;
  const filePath = path.join(__dirname, '../integrate/domestic/dataBeforeIntegration', `${fileName}.json`);
  const result = await fetchWeeklyCharts(startDate, endDate, chartType);
  fs.writeFileSync(filePath, JSON.stringify(result));
  winLogger.info('check file', { filePath });
  return result;
}

function fetchArtistInfo(platform, artistID) {
  switch (platform) {
    case 'bugs':
      return bugs.fetchArtistInfo(artistID);
    case 'genie':
      return genie.fetchArtistInfo(artistID);
    case 'melon':
      return melon.fetchArtistInfo(artistID);
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}

async function processBatch(batch) {
  const artistData = [];

  for await (const artist of batch) {
    const platformKeys = Object.keys(artist.platforms);
    let selectedPlatform = null;

    if (platformKeys.includes('bugs')) {
      selectedPlatform = 'bugs';
    } else if (platformKeys.includes('genie')) {
      selectedPlatform = 'genie';
    } else if (platformKeys.includes('melon')) {
      selectedPlatform = 'melon';
    }

    if (selectedPlatform) {
      const { artistID } = artist.platforms[selectedPlatform];
      try {
        const info = await fetchArtistInfo(selectedPlatform, artistID);
        artistData.push({
          ...artist,
          artistImage: info.artistImage,
          debut: info.debut,
        });
      } catch (error) {
        console.error(`Failed to fetch artist info for ${artist.artistKey} from ${selectedPlatform}:`, error);
      }
    }
  }

  return artistData;
}

export async function fetchArtistsInfo(artists) {
  winLogger.info('start fetchArtistsInfo');
  const BATCH_SIZE = 10;
  const results = [];
  for (let i = 0; i < artists.length; i += BATCH_SIZE) {
    const batch = artists.slice(i, i + BATCH_SIZE);
    // eslint-disable-next-line no-await-in-loop
    const batchResults = await processBatch(batch);
    results.push(...batchResults);
  }
  winLogger.info('done fetchArtistsInfo');
  return results;
}
