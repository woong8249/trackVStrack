/* eslint-disable no-use-before-define */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import redisClient from '../../redis/redisClient.js';

import * as bugs from './bugs.js';
import * as genie from './genie.js';
import * as melon from './melon.js';

const modules = [melon, bugs, genie];

function stringifyMembers(input) {
  if (Array.isArray(input)) {
    return input.map(item => Object.fromEntries(Object.entries(item)
      .map(([key, value]) => [key, typeof value !== 'string' ? JSON.stringify(value) : value])));
  }
  return Object.fromEntries(Object.entries(input)
    .map(([key, value]) => [key, typeof value !== 'string' ? JSON.stringify(value) : value]));
}

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
    const isSavedTrack = await redisClient.sIsMember('trackList', redisKeyName);
    if (isSavedTrack) {
      alreadySavedTrack(track, redisKeyName, number);
    } else {
      await redisClient.sAdd('trackList', redisKeyName);
      await redisClient.HSET(redisKeyName, stringifyMembers(track));
    }
  }
}

export async function integrateDomesticPlatformChart(startDate, endDate, chartType) {
  const promises = modules.map(it => it.fetchChartsForDateRangeInParallel(startDate, endDate, chartType));
  const [melonCharts, bugsCharts, genieCharts] = await Promise.all(promises);
  const integrate = [...melonCharts, ...bugsCharts, ...genieCharts];
  for await (const chart of integrate) {
    const tracksArray = mappingChartDataToTrack(chart);
    await saveToRedis(tracksArray);
  }
}
