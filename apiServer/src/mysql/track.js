import pool from './pool.js';

export async function getRelatedTracks(search, fields) {
  const conn = await pool.getConnection();
  const selectFields = fields.join(',');
  const query = `
      SELECT ${selectFields}
      FROM tracks
      WHERE 
        titleKeyword LIKE ?
        OR JSON_UNQUOTE(JSON_EXTRACT(platforms, '$.melon.trackInfo.title')) LIKE ?
        OR JSON_UNQUOTE(JSON_EXTRACT(platforms, '$.genie.trackInfo.title')) LIKE ?
        OR JSON_UNQUOTE(JSON_EXTRACT(platforms, '$.bugs.trackInfo.title')) LIKE ?
      LIMIT 5;
    `;
  const searchParam = `%${search}%`;
  const tracks = (await conn.query(query, [searchParam.toLocaleLowerCase(), searchParam, searchParam, searchParam]))[0];
  conn.release();
  return tracks;
}

export async function getTrackWithArtist(id) {
  const conn = await pool.getConnection();
  const query = `
    SELECT 
    ttd.id,
    ttd.titleKeyword,
    ttd.releaseDate,
    ttd.trackImages,
    ttd.platforms,
    ttd.lyrics,
    a.id as artistId,
    a.artistKeyword, 
    a.debut as artistDebut,
    a.artistImage
    FROM (
      SELECT t.id, t.titleKeyword, t.releaseDate, t.lyrics, t.trackImages, t.platforms, td.artistId
      FROM tracks as t
      LEFT JOIN trackDetails as td
      ON t.id = td.trackId
      WHERE t.id = ${id}
    ) as ttd
    LEFT JOIN artists as a
    ON ttd.artistId = a.id;
    `;
  const trackWithArtistInfo = (await conn.query(query))[0];
  conn.release();
  return trackWithArtistInfo;
}
