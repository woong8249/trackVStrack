import pool from './pool.js';

export async function getTrackWithArtist(id) {
  const conn = await pool.getConnection();
  try {
    const query = `
      SELECT 
        ttd.id,
        JSON_UNQUOTE(JSON_EXTRACT(ttd.platforms, '$.melon.trackInfo.title')) AS trackTitleMelon,
        JSON_UNQUOTE(JSON_EXTRACT(ttd.platforms, '$.genie.trackInfo.title')) AS trackTitleGenie,
        JSON_UNQUOTE(JSON_EXTRACT(ttd.platforms, '$.bugs.trackInfo.title')) AS trackTitleBugs,
        ttd.releaseDate,
        ttd.trackImages,
        ttd.platforms,
        ttd.lyrics,
        a.id as artistId,
        JSON_UNQUOTE(JSON_EXTRACT(a.platforms, '$.melon.artistName')) AS artistNameMelon,
        JSON_UNQUOTE(JSON_EXTRACT(a.platforms, '$.genie.artistName')) AS artistNameGenie,
        JSON_UNQUOTE(JSON_EXTRACT(a.platforms, '$.bugs.artistName')) AS artistNameBugs,
        a.debut as artistDebut,
        a.artistImage
      FROM (
        SELECT 
          t.id,
          t.titleKeyword,
          t.releaseDate,
          t.lyrics,
          t.trackImages,
          t.platforms,
          td.artistId
        FROM tracks AS t
        LEFT JOIN trackDetails AS td
        ON t.id = td.trackId
        WHERE t.id = ?
      ) AS ttd
      LEFT JOIN artists AS a
      ON ttd.artistId = a.id;
    `;
    const trackWithArtistInfo = (await conn.query(query, [id]))[0];
    return trackWithArtistInfo;
  } finally {
    conn.release();
  }
}

export async function getRelatedTracks(search, options) {
  const {
    limit, offset, includeThumbnails, includeArtistInfo,
  } = options;
  !(limit) && Object.assign(options, { limit: 5 });
  !(offset) && Object.assign(options, { offset: 0 });
  const cteFields = [
    'tracks.id AS trackId',
    'JSON_UNQUOTE(JSON_EXTRACT(tracks.platforms, \'$.melon.trackInfo.title\')) AS trackTitleMelon',
    'JSON_UNQUOTE(JSON_EXTRACT(tracks.platforms, \'$.genie.trackInfo.title\')) AS trackTitleGenie',
    'JSON_UNQUOTE(JSON_EXTRACT(tracks.platforms, \'$.bugs.trackInfo.title\')) AS trackTitleBugs',
  ];

  const selectFields = [
    'UT.trackId AS trackId',
    'trackTitleMelon',
    'trackTitleGenie',
    'trackTitleBugs',
  ];

  if (includeThumbnails) {
    cteFields.push('tracks.thumbnails AS trackThumbnails');
    selectFields.push('trackThumbnails');
  }

  if (includeArtistInfo) {
    selectFields.push(
      'JSON_UNQUOTE(JSON_EXTRACT(A.platforms, \'$.melon.artistName\')) AS artistNameMelon',
      'JSON_UNQUOTE(JSON_EXTRACT(A.platforms, \'$.genie.artistName\')) AS artistNameGenie',
      'JSON_UNQUOTE(JSON_EXTRACT(A.platforms, \'$.bugs.artistName\')) AS artistNameBugs',
    );
  }

  const query = `
    WITH UT AS (
      SELECT DISTINCT
        ${cteFields.join(', ')}
      FROM
        tracks
      WHERE
        tracks.titleKeyword LIKE ?
        OR LOWER(JSON_UNQUOTE(JSON_EXTRACT(tracks.platforms, '$.melon.trackInfo.title'))) LIKE LOWER(?)
        OR LOWER(JSON_UNQUOTE(JSON_EXTRACT(tracks.platforms, '$.genie.trackInfo.title'))) LIKE LOWER(?)
        OR LOWER(JSON_UNQUOTE(JSON_EXTRACT(tracks.platforms, '$.bugs.trackInfo.title'))) LIKE LOWER(?)
      LIMIT ? OFFSET ?
    )  
    SELECT 
      ${selectFields.join(', ')}
    FROM UT
    JOIN trackDetails AS TD ON UT.trackId = TD.trackId
    JOIN artists AS A ON TD.artistId = A.id;
    `;

  const searchParam = `%${search}%`;
  const conn = await pool.getConnection();
  try {
    const tracks = (await conn.query(query, [searchParam.toLocaleLowerCase(), searchParam, searchParam, searchParam, options.limit, options.offset]))[0];
    return tracks;
  } finally {
    conn.release();
  }
}
