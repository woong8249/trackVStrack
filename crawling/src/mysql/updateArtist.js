import winLogger from '../util/winston.js';

import pool from './pool.js';

export default async function updateArtistsAddInfoBulk(artists, batchSize = 10) {
  winLogger.info('start updateArtistsBulk');
  const connection = await pool.getConnection();
  try {
    for (let i = 0; i < artists.length; i += batchSize) {
      const batch = artists.slice(i, i + batchSize);
      let query = 'UPDATE artists SET ';
      const debutCases = [];
      const imageCases = [];
      const ids = [];
      batch.forEach(artist => {
        debutCases.push(`WHEN id = ${artist.id} THEN '${artist.debut}'`);
        imageCases.push(`WHEN id = ${artist.id} THEN '${artist.artistImage}'`);
        ids.push(artist.id);
      });
      query += 'debut = CASE ' + debutCases.join(' ') + ' END, ';
      query += 'artistImage = CASE ' + imageCases.join(' ') + ' END ';
      query += 'WHERE id IN (' + ids.join(',') + ')';
      // eslint-disable-next-line no-await-in-loop
      await connection.query(query);
    }
    winLogger.info('All artists updated successfully');
  } catch (error) {
    console.error('Error updating artists:', error);
  } finally {
    connection.release();
  }
}
