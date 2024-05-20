import pool from './pool.js';

export async function getRelatedTracks(search, fields) {
  const conn = await pool.getConnection();

  // CTE에 필요한 필드 (id와 titleKeyword는 항상 포함)
  const cteFields = ['tracks.id', 'tracks.titleKeyword'];
  if (fields.includes('thumbnails')) {
    cteFields.push('tracks.thumbnails');
  }

  // 최종 SELECT 구문에 필요한 필드
  const selectFields = fields
    .filter(field => field !== 'artistKeyword' && field !== 'artistId')
    .map(field => `unique_tracks.${field}`)
    .join(',');
  const artistFields = fields.includes('artistKeyword') || fields.includes('artistId')
    ? ', artists.id AS artistId, artists.artistKeyword'
    : '';

  const query = `
    WITH unique_tracks AS (
        SELECT DISTINCT ${cteFields.join(', ')}
        FROM tracks
        WHERE 
          tracks.titleKeyword LIKE ?
          OR JSON_UNQUOTE(JSON_EXTRACT(tracks.platforms, '$.melon.trackInfo.title')) LIKE ?
          OR JSON_UNQUOTE(JSON_EXTRACT(tracks.platforms, '$.genie.trackInfo.title')) LIKE ?
          OR JSON_UNQUOTE(JSON_EXTRACT(tracks.platforms, '$.bugs.trackInfo.title')) LIKE ?
        LIMIT 5
    )
    SELECT ${selectFields} ${artistFields}
    FROM unique_tracks
    JOIN trackDetails ON unique_tracks.id = trackDetails.trackId
    ${fields.includes('artistKeyword') || fields.includes('artistId') ? 'JOIN artists ON trackDetails.artistId = artists.id' : ''}
    `;

  const searchParam = `%${search}%`;
  const tracks = (await conn.query(query, [searchParam, searchParam, searchParam, searchParam]))[0];
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
