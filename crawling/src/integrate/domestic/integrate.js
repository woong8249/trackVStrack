/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable no-restricted-syntax */
import path from 'path';

import ss from 'string-similarity';

import * as bugs from '../../platforms/domestic/bugs.js';
import * as genie from '../../platforms/domestic/genie.js';
import * as melon from '../../platforms/domestic/melon.js';
import { loadJSONFiles, parseJSONProperties, stringifyMembers } from '../../util/json.js';
import redisClient from '../../redis/redisClient.js';
import redisKey from '../../../config/redisKey.js';
import { removeDuplicates } from '../../util/array.js';
import winLogger from '../../util/winston.js';

import artistException from './artistException.json';
import titleException from './titleException.json';

const modules = { melon, bugs, genie };
const { trackList, artistList } = redisKey;

export function isSameLyrics(lyrics1, lyrics2) {
  const similarity = ss.compareTwoStrings(lyrics1.toLowerCase(), lyrics2.toLowerCase());
  if (similarity > 0.75)
    return true;
  return false;
}

function mergeArtists(artist1, artists2) {
  const mergedArtists = {};
  [artist1, artists2].forEach(artists => {
    artists.forEach(artist => {
      const key = artist.artistKey;
      if (mergedArtists[key]) {
        Object.entries(artist.platforms).forEach(([platform, details]) => {
          mergedArtists[key].platforms[platform] = details;
        });
      } else {
        mergedArtists[key] = { ...artist };
      }
    });
  });

  return Object.values(mergedArtists);
}

function mergeTrackInfo(info1, info2) {
  return {
    title: info1.title,
    trackID: info1.trackID,
    albumID: info1.albumID || info2.albumID,
  };
}

// 차트 정보 병합 함수
function mergeChartInfos(charts1, charts2) {
  const chartMap = new Map();

  // 첫 번째 차트 정보 추가
  charts1.forEach(chart => {
    const key = chart.startDate + chart.endDate; // startDate와 endDate를 키로 사용
    chartMap.set(key, chart);
  });

  // 두 번째 차트 정보 추가, 중복 검사
  charts2.forEach(chart => {
    const key = chart.startDate + chart.endDate;
    if (!chartMap.has(key)) {
      chartMap.set(key, chart);
    }
  });

  return Array.from(chartMap.values());
}

// 플랫폼 정보 병합
function mergePlatforms(platforms1, platforms2) {
  const platforms = {};

  // 모든 키 (플랫폼) 검색
  new Set([...Object.keys(platforms1), ...Object.keys(platforms2)]).forEach(key => {
    const plat1 = platforms1[key];
    const plat2 = platforms2[key];

    if (plat1 && plat2) {
      platforms[key] = {
        trackInfo: mergeTrackInfo(plat1.trackInfo, plat2.trackInfo),
        chartInfos: mergeChartInfos(plat1.chartInfos, plat2.chartInfos),
      };
    } else {
      platforms[key] = plat1 || plat2; // 둘 중 하나만 존재하는 경우 그대로 사용
    }
  });

  return platforms;
}

export function integrateTracks(tracks, result = {}) {
  if (tracks.length === 0) {
    return result;
  }
  const track = tracks.pop();
  const { trackKey } = track;
  if (!result[trackKey]) {
    Object.assign(result, { [trackKey]: track });
  } else {
    const { platforms, artists } = track;
    const { platforms: savedPlatforms, artists: savedArtists } = result[trackKey];
    result[trackKey].platforms = mergePlatforms(savedPlatforms, platforms);
    result[trackKey].artists = mergeArtists(savedArtists, artists);
  }
  return integrateTracks(tracks, result);
}

export async function getItemsWithSameKeyword(listKey, keyword) {
  // itemKey = `trackList or artistList/${keyword}/number`
  const keywordList = await redisClient.sMembers(listKey);
  const filteredKeywordList = keywordList.filter(item => {
    const [_prefix, currentItemKeyword, subFix] = item.split('/');
    return currentItemKeyword === keyword && parseInt(subFix, 10) >= 0;
  });

  const promises = filteredKeywordList.map(_keyword => redisClient.hGetAll(_keyword));
  const items = await Promise.all(promises);
  const parsedResult = items.map(item => parseJSONProperties(item));
  return parsedResult;
}

export async function decideKeyNameOfArtist(artist) {
  const { artistKeyword, platforms } = artist;
  const platformName = Object.keys(platforms)[0];
  const artistsWithSameKeyword = await getItemsWithSameKeyword(artistList, artistKeyword.toLowerCase());
  const { artistID: artistID1, artistName: artistName1 } = platforms[platformName];
  const artistDefaultKeyName = `artist/${artistKeyword.toLowerCase()}/0`;
  const result = { artistKey: artistsWithSameKeyword.length > 0 ? undefined : artistDefaultKeyName };
  const decidedArtist = Object.assign(artist, result);

  // 같은 artistKeyword가 없는경우 (null인경우 어떻게하나?)
  if (artistsWithSameKeyword.length === 0) {
    await redisClient.sAdd(artistList, artistDefaultKeyName);
    await redisClient.hSet(artistDefaultKeyName, stringifyMembers(decidedArtist));
    return decidedArtist;
  }

  // 같은 플랫폼인경우 정확히 비교
  for (const savedArtist of artistsWithSameKeyword) {
    const { platforms: savedPlatforms } = savedArtist;
    const savedPlatformKeyList = Object.keys(savedPlatforms);
    const isSamePlatform = savedPlatformKeyList.some(savedPlatformName => savedPlatformName === platformName);
    const artistID2 = savedPlatforms[platformName]?.artistID;
    const isSameArtist = artistID1 === artistID2;
    if (isSamePlatform && isSameArtist) {
      return savedArtist;
    }
  }

  // 다픈 플랫폼인경우 유사도가 가장 높은것 선별
  const artistWithHighestSimilarity = artistsWithSameKeyword.map(savedArtist => {
    const { platforms: savedPlatforms } = savedArtist;
    let finalSimilarity = 0;
    Object.entries(savedPlatforms).forEach(([key, value]) => {
      const { artistName: artistName2 } = value;
      const similarity = ss.compareTwoStrings(artistName1, artistName2);
      if (similarity > finalSimilarity) {
        finalSimilarity = similarity;
      }
    });
    return { savedArtist, similarity: finalSimilarity };
  }).reduce((pre, cur) => {
    if (pre.similarity > cur.similarity)
      return pre;
    return cur;
  });

  result.artistKey = artistWithHighestSimilarity.savedArtist.artistKey;
  Object.assign(decidedArtist, result);
  const { savedArtist } = artistWithHighestSimilarity;
  savedArtist.platforms[platformName] = decidedArtist.platforms[platformName];
  await redisClient.hSet(savedArtist.artistKey, stringifyMembers(savedArtist));
  return savedArtist;
}

export async function decideKeyNameOfArtists(track) {
  // 병렬로 실행되면 안됨
  const { artists } = track;
  const allResult = [];
  for await (const artist of artists) {
    const result = await decideKeyNameOfArtist(artist);
    allResult.push(result);
  }
  return Object.assign(track, { artists: allResult });
}

function compareArrays(a, b) {
  const longer = a.length >= b.length ? a : b;
  const shorter = a.length >= b.length ? b : a;
  if (a.length === b.length) {
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.length === sortedB.length && sortedA.every((element, index) => element === sortedB[index]);
  }
  return shorter.every(element => longer.includes(element));
}

export async function decideKeyNameOfTrack(track) {
  // 병렬로 실행되면 안됨
  const {
    titleKeyword,
    lyrics,
    platforms,
    artists,
  } = track;
  const artistKeys = artists.map(artist => artist.artistKey);
  const platformName = Object.keys(platforms)[0];
  const deepCopiedPlatform = JSON.parse(JSON.stringify(platforms));
  delete deepCopiedPlatform[platformName].chartInfos;
  const tracksWithSameTitleKeyword = await getItemsWithSameKeyword(trackList, titleKeyword.toLowerCase());
  const trackSubFixes = tracksWithSameTitleKeyword.map(item => item.trackKey.split('/')[2]);
  const trackDefaultKeyName = `track/${titleKeyword.toLowerCase()}/0`;
  const result = {
    trackKey: trackSubFixes.length > 0 ? undefined : trackDefaultKeyName,
  };
  const decidedTrack = Object.assign(track, result);

  // 1. trackTitleKeyword이 겹치는경우가 없는경우
  if (tracksWithSameTitleKeyword.length === 0) {
    const trackToSave = stringifyMembers({
      trackKey: trackDefaultKeyName,
      titleKeyword,
      lyrics,
      platforms: deepCopiedPlatform,
      artistKeys,
    });
    await redisClient.sAdd(trackList, trackDefaultKeyName);
    await redisClient.hSet(trackDefaultKeyName, trackToSave);
    return decidedTrack;
  }

  // titleKeyword가 같은 곡들이 존재하는경우
  // 같은 트랙을 찾아보고 trackKey를 결정한다
  for (const savedTrack of tracksWithSameTitleKeyword) {
    const {
      trackKey: savedTrackKey,
      lyrics: savedLyrics,
      platforms: savedPlatforms,
      artistKeys: savedArtistKeys,
    } = savedTrack;
    const savedPlatformKeyList = Object.keys(savedPlatforms);
    const isSamePlatform = savedPlatformKeyList.some(savedPlatformName => savedPlatformName === platformName);
    if (isSamePlatform) {
      const { trackID: target1 } = savedPlatforms[platformName].trackInfo;
      const { trackID: target2 } = platforms[platformName].trackInfo;
      const isSameTrack = target1 === target2;
      if (isSameTrack) {
        result.trackKey = savedTrackKey;
        Object.assign(decidedTrack, result);
        return decidedTrack;
      }
    }
    const isSimilarLyrics = isSameLyrics(savedLyrics, lyrics);
    const isSameArtistKey = compareArrays(savedArtistKeys, artistKeys);

    if (isSimilarLyrics && isSameArtistKey) {
      result.trackKey = savedTrackKey;
      savedPlatforms[platformName] = deepCopiedPlatform[platformName];
      // eslint-disable-next-line no-await-in-loop
      await redisClient.hSet(savedTrackKey, stringifyMembers(savedTrack));
      Object.assign(decidedTrack, result);
      return decidedTrack;
    }
  }

  // titleKeyword가 같은 곡들이 존재하지만
  // 같은 트랙으로 판단되는 곡이 없는경우 number를 추가해서 저장한다.
  // if (!result.trackKey) {
  const newKey = `track/${titleKeyword.toLowerCase()}/${tracksWithSameTitleKeyword.length}`;
  result.trackKey = newKey;
  Object.assign(decidedTrack, result);
  await redisClient.sAdd(trackList, newKey);
  const trackToSave = stringifyMembers({
    trackKey: newKey,
    titleKeyword,
    lyrics,
    platforms: deepCopiedPlatform,
    artistKeys,
  });
  await redisClient.hSet(newKey, stringifyMembers(trackToSave));
  return decidedTrack;
}
function checkTitleException(titleKeyword) {
  const isException = titleException[titleKeyword];
  if (isException) {
    // eslint-disable-next-line no-param-reassign
    titleKeyword = titleException[titleKeyword];
  }

  return titleKeyword;
}

function checkArtistException(artists) {
  artists.forEach(artist => {
    const isException = artistException[artist.artistKeyword];
    if (isException) {
      // eslint-disable-next-line no-param-reassign
      artist.artistKeyword = isException;
    }
  });
  return artists;
}

export async function findArtistID(artists, platformName) {
  for await (const artist of artists) {
    const { artistKeyword } = artist;
    const { artistID } = artist;
    if (!artistID) {
      const sameArtistKeywordList = await getItemsWithSameKeyword(artistList, artistKeyword.toLowerCase());
      for (const artistWithSameKeyword of sameArtistKeywordList) {
        const { platforms } = artistWithSameKeyword;
        if (platforms[platformName]?.artistID) {
          artist.artistID = platforms[platformName].artistID;
        }
      }
    }
  }
  return artists;
}

export function mappingTrackBeforeIntegrate(tracksOrTracksArray) {
  const array = Array.isArray(tracksOrTracksArray) ? tracksOrTracksArray : [tracksOrTracksArray];
  const result = [];
  for (const item of array) {
    const trackEntries = Object.entries(item);
    for (const [_key, value] of trackEntries) {
      const { platforms } = value;
      const platformName = Object.keys(platforms)[0];
      const {
        thumbnail, releaseDate, trackImage, lyrics,
      } = platforms[platformName].trackInfo;
      let { artists } = platforms[platformName].trackInfo;
      const { chartInfos } = platforms[platformName];
      artists = artists.map(artist => ({
        artistKeyword: artist.artistKeyword,
        platforms: {
          [platformName]: {
            artistName: artist.artistName,
            artistID: artist.artistID,
          },
        },
      }));
      const mappingResult = {
        titleKeyword: checkTitleException(value.titleKeyword),
        artists: checkArtistException(artists),
        releaseDate,
        lyrics,
        platforms: {
          [platformName]: {
            trackInfo: {
              title: platforms[platformName].trackInfo.title,
              trackID: platforms[platformName].trackInfo.trackID,
              albumID: platforms[platformName].trackInfo.albumID,
            },
            chartInfos,
          },
        },
        trackImages: [trackImage],
        thumbnails: [thumbnail],
      };
      result.push(mappingResult);
    }
  }

  return result;
}

export async function addAdditionalInfoToTracks(classifiedTracks, platformName, result = {}, time = 30_000) {
  const classifiedTrackEntries = Object.entries(classifiedTracks);
  if (classifiedTrackEntries.length === 0) {
    return result;
  }
  const [key, value] = classifiedTrackEntries.pop();
  const { trackInfo } = value.platforms[platformName];
  const { trackID, albumID } = trackInfo;
  const func = modules[platformName].fetchAdditionalInformationOfTrack;
  try {
    const additionalInfo = await func(trackID, albumID);
    Object.assign(trackInfo, additionalInfo);
    Object.assign(result, { [key]: value });
    return addAdditionalInfoToTracks(Object.fromEntries(classifiedTrackEntries), platformName, result);
  } catch (err) {
    winLogger.warn(err);
    winLogger.info('delay start', { time });
    await new Promise(res => setTimeout(res, time));
    winLogger.info('delay done');
    classifiedTrackEntries.push([key, value]);
    return addAdditionalInfoToTracks(Object.fromEntries(classifiedTrackEntries), platformName, result, time * 1.2);
  }
}

export async function mappingChartDataToTrack(chartOrCharts) {
  const charts = Array.isArray(chartOrCharts) ? chartOrCharts : [chartOrCharts];
  const mappedTracks = [];
  for await (const chart of charts) {
    const { chartScope, chartDetails, platform } = chart;
    const tracks = [];
    for await (const chart of chartDetails) {
      const {
        title, titleKeyword, artists, thumbnail, trackID, albumID, rank,
      } = chart;
      const track = {
        titleKeyword,
        platforms: {
          [platform]: {
            trackInfo: {
              title,
              artists: await findArtistID(artists, platform),
              trackID: trackID || null,
              albumID: albumID || null,
              thumbnail,
            },
            chartInfos: [{ rank, ...chartScope }],
          },
        },
      };
      tracks.push(track);
    }
    mappedTracks.push(...tracks);
  }
  return mappedTracks;
}

export function classifyTracks(tracks, platformName, number = 0, result = {}) {
  if (tracks.length === 0) {
    return result;
  }
  const track = tracks.pop();
  const keyName = track.titleKeyword + '/' + number;
  const sameTitleKeywordTrack = result[keyName];

  if (!sameTitleKeywordTrack) {
    Object.assign(result, { [keyName]: track });
    return classifyTracks(tracks, platformName, 0, result);
  }

  const { platforms } = track;
  const { trackInfo: savedTrackInfo } = sameTitleKeywordTrack.platforms[platformName];
  let { chartInfos: savedChartInfos } = sameTitleKeywordTrack.platforms[platformName];
  const { trackID: compareTarget1 } = savedTrackInfo;
  const { trackID: compareTarget2 } = platforms[platformName].trackInfo;
  const isSameTrack = compareTarget1 === compareTarget2;

  if (isSameTrack) {
    savedChartInfos.push(...platforms[platformName].chartInfos);
    savedChartInfos = removeDuplicates(savedChartInfos);
    return classifyTracks(tracks, platformName, 0, result);
  }
  tracks.push(track);
  return classifyTracks(tracks, platformName, number + 1, result);
}

export function integrateJSONFiles(dirPath) {
  const jsonFilesArray = loadJSONFiles(dirPath);
  const tracks = jsonFilesArray.reduce((pre, cur) => {
    pre.push(...Object.values(cur));
    return pre;
  }, []);
  return Object.values(integrateTracks(tracks));
}
