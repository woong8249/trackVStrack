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
      const params = [];

      batch.forEach(artist => {
        debutCases.push('WHEN id = ? THEN ?');
        imageCases.push('WHEN id = ? THEN ?');
        ids.push(artist.id);
        params.push(artist.id, artist.debut === null ? null : artist.debut);
        params.push(artist.id, artist.artistImage === null ? null : artist.artistImage);
      });

      query += 'debut = CASE ' + debutCases.join(' ') + ' END, ';
      query += 'artistImage = CASE ' + imageCases.join(' ') + ' END ';
      query += 'WHERE id IN (' + ids.map(() => '?').join(',') + ')';

      // eslint-disable-next-line no-await-in-loop
      await connection.query(query, [...params, ...ids]);
    }
    winLogger.info('All artists updated successfully');
  } catch (error) {
    console.error('Error updating artists:', error);
    winLogger.error('Error updating artists:', error);
  } finally {
    connection.release();
  }
}
