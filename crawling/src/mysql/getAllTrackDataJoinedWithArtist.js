import winLogger from '../util/winston.js';

import pool from './pool.js';

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

export default async function getAllTrackDataJoinedWithArtist() {
  const conn = await pool.getConnection();
  const queryResult = (await conn.query(query))[0];
  winLogger.info('mysql data import success');
  conn.release();
  return queryResult;
}
