/* eslint-disable no-use-before-define */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { parseJSONProperties, stringifyMembers } from '../../util/json.js';
import redisClient from '../../redis/redisClient.js';
import redisKey from '../../../config/redisKey.js';
import winLogger from '../../util/winston.js';

import * as bugs from './bugs.js';
import * as genie from './genie.js';
import * as melon from './melon.js';

// const modules = [melon, bugs, genie];
const modules = { melon, bugs, genie };
const { trackList } = redisKey;

function removeDuplicates(chartData) {
  const seen = new Set();
  const uniqueCharts = [];

  for (const chart of chartData) {
    // 객체를 문자열로 변환하여 비교
    const chartString = JSON.stringify(chart);
    if (!seen.has(chartString)) {
      seen.add(chartString);
      uniqueCharts.push(chart);
    }
  }
  return uniqueCharts;
}

export function mappingChartDataToTrack(chartOrCharts) {
  const charts = Array.isArray(chartOrCharts) ? chartOrCharts : [chartOrCharts];
  const mappedTracks = [];
  charts.forEach(chart => {
    const { chartScope, chartDetails, platform } = chart;
    const tracks = chartDetails.map(track => {
      const mappingTrack = {
        title: track.title,
        titleKeyword: track.titleKeyword,
        artists: track.artists,
        artistKeyword: track.artistKeyword,
        platforms: {
          [platform]: {
            trackInfo: {
              trackID: track.trackID,
              albumID: track.albumID,
              thumbnail: track.thumbnail,
            },
            chartInfos: [chartScope],
          },
        },
      };
      return mappingTrack;
    });
    mappedTracks.push(...tracks);
  });
  return mappedTracks;
}

async function alreadySavedTrack(track, redisKeyName, number) {
  const { artistKeyword, platforms } = track;
  const platformName = Object.keys(platforms)[0];

  const { platforms: savedPlatformsStr, artistKeyword: savedArtistKeyword } = await redisClient.hGetAll(redisKeyName);
  const savedPlatform = JSON.parse(savedPlatformsStr);
  const savedPlatformKeyList = Object.keys(savedPlatform);
  const isSamePlatform = savedPlatformKeyList.some(savedPlatformName => savedPlatformName === platformName);
  const isSameArtist = savedArtistKeyword === artistKeyword;

  if (isSameArtist && isSamePlatform) { // 같은 곡 같은 플랫폼인경우
    savedPlatform[platformName].chartInfos.push(platforms[platformName].chartInfos[0]);
    savedPlatform[platformName].chartInfos = removeDuplicates(savedPlatform[platformName].chartInfos);
  } else if (isSameArtist && !isSamePlatform) { // 같은 곡 다른 플랫폼인경우
    savedPlatform[platformName] = platforms[platformName];
    savedPlatformKeyList.length === 1 // 기존 저장된 플랫폼이 유일하게 bugs인 경우
    && savedPlatformKeyList[0] === 'bugs'
    && await redisClient.HSET(redisKeyName, { artists: JSON.stringify(track.artists) });
  } else if (!isSameArtist && isSamePlatform) { // 다른 곡인경우
    saveToRedis(track, number + 1);
  }
  await redisClient.HSET(redisKeyName, 'platforms', JSON.stringify(savedPlatform));
}

async function saveToRedis(tracksOrTrack, number = 0) {
  const tracks = Array.isArray(tracksOrTrack) ? tracksOrTrack : [tracksOrTrack];
  for (const track of tracks) {
    if (number === 3) {
      throw new Error('something is wrong');
    }
    const redisKeyName = track.titleKeyword + `/${number}`;
    const isSavedTrack = await redisClient.sIsMember(trackList, redisKeyName);
    const hasReleaseDate = Boolean(track.releaseDate);
    if (hasReleaseDate) {
      await redisClient.HSET(redisKeyName, stringifyMembers(track));
    } else if (isSavedTrack) {
      alreadySavedTrack(track, redisKeyName, number);
    } else {
      await redisClient.sAdd(trackList, redisKeyName);
      await redisClient.HSET(redisKeyName, stringifyMembers(track));
    }
  }
}

export async function integrateDomesticPlatformChart(startDate, endDate, chartType) {
  const promises = Object.values(modules).map(it => it.fetchChartsForDateRangeInParallel(startDate, endDate, chartType));
  const [melonCharts, bugsCharts, genieCharts] = await Promise.all(promises);
  const integrate = [...melonCharts, ...bugsCharts, ...genieCharts];
  for await (const chart of integrate) {
    const tracksArray = mappingChartDataToTrack(chart);
    await saveToRedis(tracksArray);
  }
}

export async function getAllTrackFromRedis() {
  const trackKeywordList = await redisClient.sMembers('trackList');
  const promises = trackKeywordList.map(trackKeyword => redisClient.hGetAll(trackKeyword));
  const tracks = await Promise.all(promises);
  const mappingTracks = tracks.map(track => parseJSONProperties(track));
  return mappingTracks;
}

export async function loadBalancingFuncFetchReleaseDateAndImage(possiblePlatforms) {
  const moduleObjects = await Promise.all(possiblePlatforms.map(async name => ({
    name,
    fetchReleaseDateAndImage: modules[name].fetchReleaseDateAndImage,
    numberOfCalls: Number(await redisClient.get(`${name}FetchReleaseDateAndImage`)) || 0,
  })));

  const selectedModule = moduleObjects.reduce((prev, current) => (prev.numberOfCalls < current.numberOfCalls ? prev : current));
  selectedModule.numberOfCalls += 1;
  const { fetchReleaseDateAndImage } = selectedModule;
  await redisClient.set(`${selectedModule.name}FetchReleaseDateAndImage`, JSON.stringify(selectedModule.numberOfCalls));
  await redisClient.expire(`${selectedModule.name}FetchReleaseDateAndImage`, 30);
  return { platformName: selectedModule.name, fetchReleaseDateAndImage };
}

async function fetchAndSaveWithRetry(fetchFunction, platformName, id, track, retries = 2, delay = 30_000, numberOfTimes = 100) {
  try {
    const count = await redisClient.get(`${platformName}FetchReleaseDateAndImage`);
    count > numberOfTimes && await new Promise(resolve => {
      winLogger.info('delay...', { delay, count });
      setTimeout(resolve, delay);
    });
    const result = await fetchFunction(id);
    await saveToRedis(Object.assign(track, result));
  } catch (error) {
    if (retries <= 1) {
      winLogger.error('Final attempt failed:', { error });
    } else {
      winLogger.info(`Retrying after delay. Attempts left: ${retries - 1}`);
      await new Promise(resolve => {
        winLogger.info('delay...', { delay });
        setTimeout(resolve, delay);
      });
      fetchAndSaveWithRetry(fetchFunction, platformName, id, track, retries - 1, delay);
    }
  }
}

export async function fetchReleaseDateAndImageInParallel(tracks) {
  const array = [];
  for (let i = 0; i < tracks.length; i += 1) {
    const { platforms: savedPlatforms } = tracks[i];
    const { platformName, fetchReleaseDateAndImage } = await loadBalancingFuncFetchReleaseDateAndImage(Object.keys(savedPlatforms));
    const id = savedPlatforms[platformName].trackInfo[platformName === 'melon' ? 'trackID' : 'albumID'];
    array.push({
      fetchReleaseDateAndImage, platformName, id, track: tracks[i],
    });
  }
  const promises = array.map(({
    fetchReleaseDateAndImage, platformName, id, track,
  }) => fetchAndSaveWithRetry(fetchReleaseDateAndImage, platformName, id, track));

  return Promise.all(promises);
}
