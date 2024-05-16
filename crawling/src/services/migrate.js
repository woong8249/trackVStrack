/* eslint-disable no-restricted-syntax */
import path from 'path';

import createTable, { doesTableHaveData } from '../mysql/createTables';
import getAllTrackDataJoinedWithArtist from '../mysql/getAllTrackDataJoinedWithArtist.js';
import insertTracks from '../mysql/insertData';
import { integrateJSONFiles } from '../integrate/domestic/integrate';
import redisClient from '../redis/redisClient.js';
import redisKey from '../../config/redisKey.js';
import { stringifyMembers } from '../util/json.js';
import winLogger from '../util/winston';

const { trackList, artistList } = redisKey;

export default async function migrate() {
  await createTable();
  const result = await doesTableHaveData();
  if (result) {
    winLogger.warn('Please empty all table information.');
  }
  const dirPath = path.join(__dirname, '../integrate/domestic/dataAfterIntegration');
  const tracks = integrateJSONFiles(dirPath);
  await insertTracks(tracks);
}

export async function loadToRedis() {
  const queryResult = await getAllTrackDataJoinedWithArtist();
  const trackMap = {};
  queryResult.forEach(track => {
    const {
      id, trackKey, titleKeyword, lyrics, platforms,
    } = track;
    if (!trackMap[id]) {
      trackMap[id] = {
        id,
        trackKey,
        titleKeyword,
        lyrics,
        platforms: Object.fromEntries(Object.entries(platforms).filter(platform => platform[1].trackInfo !== null)),
        artists: [],
      };
    }
    const artistInfo = {
      id: track.artist_id,
      artistKey: track.artist_key,
      artistKeyword: track.artist_keyword,
      platforms: track.artist_platforms,
    };
    trackMap[id].artists.push(artistInfo);
  });

  const tracks = Object.values(trackMap);
  for await (const track of tracks) {
    const { trackKey, artists } = track;
    await redisClient.sAdd(trackList, trackKey);
    track.artistKeys = track.artists.map(artist => artist.artistKey);
    await redisClient.hSet(trackKey, stringifyMembers(track));
    for await (const artist of artists) {
      const { artistKey } = artist;
      await redisClient.sAdd(artistList, artistKey);
      await redisClient.hSet(artistKey, stringifyMembers(artist));
    }
  }
  winLogger.info('load to redis success');
}
