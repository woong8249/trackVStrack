/* eslint-disable no-restricted-syntax */
import pool from '../mysql/pool.js';
import redisClient from '../redis/redisClient.js';
import redisKey from '../../config/redisKey.js';
import { stringifyMembers } from '../util/json';
import winLogger from '../util/winston.js';

const { trackList, artistList } = redisKey;

const query = `SELECT 
artists.id AS artist_id,
artists.artistKey AS artist_key,
artists.artistKeyword AS artist_keyword,
artists.platforms AS artist_platforms,
tracks.id AS id,
tracks.trackKey AS trackKey,
tracks.titleKeyword AS titleKeyword,
tracks.lyrics AS lyrics,
JSON_OBJECT(
    'genie', JSON_OBJECT('trackInfo', JSON_EXTRACT(tracks.platforms, '$.genie.trackInfo')),
    'bugs', JSON_OBJECT('trackInfo', JSON_EXTRACT(tracks.platforms, '$.bugs.trackInfo')),
    'melon', JSON_OBJECT('trackInfo', JSON_EXTRACT(tracks.platforms, '$.melon.trackInfo'))
) AS platforms
FROM trackDetails
JOIN artists ON trackDetails.artistId = artists.id
JOIN tracks ON trackDetails.trackId = tracks.id;`;

export default async function loadToRedis() {
  const conn = await pool.getConnection();
  const queryResult = (await conn.query(query))[0];
  winLogger.info('mysql data import success');
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
