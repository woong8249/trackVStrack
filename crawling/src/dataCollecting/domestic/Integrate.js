/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable no-restricted-syntax */

import ss from 'string-similarity';

import { parseJSONProperties, stringifyMembers } from '../../util/json.js';
import redisClient from '../../redis/redisClient.js';
import redisKey from '../../../config/redisKey.js';
import { removeDuplicates } from '../../util/array.js';
import winLogger from '../../util/winston.js';

import * as bugs from './bugs.js';
import * as genie from './genie.js';
import * as melon from './melon.js';
import exception from './exception.json';

const modules = { melon, bugs, genie };
const { trackList, artistList } = redisKey;

export function isSameLyrics(lyrics1, lyrics2) {
  const similarity = ss.compareTwoStrings(lyrics1, lyrics2);
  if (similarity > 0.8)
    return true;
  return false;
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
    const { platforms } = track;
    const platformName = Object.keys(platforms)[0];
    // eslint-disable-next-line no-param-reassign
    result[trackKey].platforms[platformName] = platforms[platformName];
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
  const artistsWithSameKeyword = await getItemsWithSameKeyword(artistList, artistKeyword);
  const { artistID: artistID1, artistName: artistName1 } = platforms[platformName];
  const artistDefaultKeyName = `artist/${artistKeyword.toLowerCase()}/0`;
  const result = { artistKey: artistsWithSameKeyword.length > 0 ? undefined : artistDefaultKeyName };
  const decidedArtist = Object.assign(artist, result);

  // 같은 artistKeyword가 없는경우
  if (artistsWithSameKeyword.length === 0) {
    await redisClient.sAdd(artistList, artistDefaultKeyName);
    await redisClient.hSet(artistDefaultKeyName, stringifyMembers(decidedArtist));
    return decidedArtist;
  }

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

  // 다픈 플랫폼중에 유사도가 가장 높은것 선별
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

export async function decideKeyNameOfTrack(track) {
  // 병렬로 실행되면 안됨
  const {
    titleKeyword,
    lyrics,
    platforms,
    artists,
  } = track;
  const { artistKey } = artists[0];
  const platformName = Object.keys(platforms)[0];
  const deepCopiedPlatform = JSON.parse(JSON.stringify(platforms));
  delete deepCopiedPlatform[platformName].chartInfos;
  const tracksWithSameTitleKeyword = await getItemsWithSameKeyword(trackList, titleKeyword);
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
      artistKey,
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
      artistKey: savedArtistKey,
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
    const isSameArtistKey = savedArtistKey === artistKey;
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
    artistKey,
  });
  await redisClient.hSet(newKey, stringifyMembers(trackToSave));
  return decidedTrack;
}
function checkException(artists) {
  artists.forEach(artist => {
    const isException = exception[artist.artistKeyword];
    if (isException) {
      // eslint-disable-next-line no-param-reassign
      artist.artistKeyword = isException;
    }
  });
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
        titleKeyword: value.titleKeyword,
        artists: checkException(artists),
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

export function mappingChartDataToTrack(chartOrCharts) {
  const charts = Array.isArray(chartOrCharts) ? chartOrCharts : [chartOrCharts];
  const mappedTracks = [];
  charts.forEach(chart => {
    const { chartScope, chartDetails, platform } = chart;
    const tracks = chartDetails.map(({
      title, titleKeyword, artists, thumbnail, trackID, albumID, rank,
    }) => ({
      titleKeyword,
      platforms: {
        [platform]: {
          trackInfo: {
            title,
            artists,
            trackID: trackID || null,
            albumID: albumID || null,
            thumbnail,
          },
          chartInfos: [{ rank, ...chartScope }],
        },
      },
    }
    ));
    mappedTracks.push(...tracks);
  });
  winLogger.error('맵핑 시키고 나서 의 개수', { count: mappedTracks.length });
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
