import pool from './pool.js';

export async function getArtistsWithoutDetail(search, options) {
  const {
    limit, offset,
  } = options;

  !(limit) && Object.assign(options, { limit: 5 });
  !(offset) && Object.assign(options, { offset: 0 });

  const fields = [
    'id',
    'JSON_UNQUOTE(JSON_EXTRACT(platforms, \'$.melon.artistName\')) AS artistNameMelon',
    'JSON_UNQUOTE(JSON_EXTRACT(platforms, \'$.genie.artistName\')) AS artistNameGenie',
    'JSON_UNQUOTE(JSON_EXTRACT(platforms, \'$.bugs.artistName\')) AS artistNameBugs',
    'artistImage',
    'debut',
  ];

  const query = `
    SELECT DISTINCT ${fields.join(', ')}
    FROM artists
    WHERE 
      artistKeyword LIKE ?
      OR JSON_UNQUOTE(JSON_EXTRACT(platforms, '$.bugs.artistName')) LIKE ?
      OR JSON_UNQUOTE(JSON_EXTRACT(platforms, '$.genie.artistName')) LIKE ?
      OR JSON_UNQUOTE(JSON_EXTRACT(platforms, '$.melon.artistName')) LIKE ?
    LIMIT 5;
  `;
  const searchParam = `%${search}%`;
  const conn = await pool.getConnection();
  try {
    const artists = (await conn.query(query, [searchParam.toLocaleLowerCase(), searchParam, searchParam, searchParam]))[0];
    console.log(artists);
    return artists;
  } finally {
    conn.release();
  }
}

export async function getArtistWithDetail(id) {
  const conn = await pool.getConnection();
  const query = `SELECT
  atd.id,
  atd.artistKeyword,
  atd.debut,
  atd.artistImage,
  t.releaseDate,
  t.id as trackId,
  t.titleKeyword,
  t.thumbnails
FROM(
    SELECT a.id, a.artistKeyword, a.debut, a.artistImage ,trackId
    FROM artists as a
    LEFT JOIN trackDetails as td
    ON a.id = td.artistId
    WHERE a.id = ${id}
  ) as atd
  LEFT JOIN tracks as t
  ON atd.trackId = t.id;
`;
  const artists = (await conn.query(query))[0];
  conn.release();
  return artists;
}
