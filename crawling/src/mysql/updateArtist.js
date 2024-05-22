import winLogger from '../util/winston.js';

import pool from './pool.js';

// 수정 필요
export default async function updateArtistsAddInfoBulk(artists) {
  winLogger.info('start updateArtistsBulk');
  const connection = await pool.getConnection();
  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const artist of artists) {
      const query = `
        UPDATE artists
        SET debut = ?, artistImage = ?
        WHERE id = ?
      `;
      const params = [
        artist.debut,
        artist.artistImage,
        artist.id,
      ];

      // eslint-disable-next-line no-await-in-loop
      await connection.query(query, params);
    }
    winLogger.info('All artists updated successfully');
  } catch (error) {
    console.error('Error updating artists:', error);
    winLogger.error('Error updating artists:', error);
  } finally {
    connection.release();
  }
}
