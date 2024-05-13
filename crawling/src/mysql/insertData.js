/* eslint-disable no-restricted-syntax */
import winLogger from '../util/winston.js';

import pool from './pool.js';

function toMysqlFormat(dateString) {
  const date = new Date(dateString);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

async function insertTrack(track, connection) {
  try {
    await connection.beginTransaction();
    const artistIds = [];
    for await (const artist of track.artists) {
      const [existing] = await connection.query(
        'SELECT id FROM artists WHERE artistKey = ?',
        [artist.artistKey],
      );
      if (existing.length > 0) {
        artistIds.push(existing[0].id);
      } else {
        const [artistResult] = await connection.query(
          'INSERT INTO artists (artistKey, artistKeyword, platforms) VALUES (?, ?, ?)',
          [artist.artistKey, artist.artistKeyword, JSON.stringify(artist.platforms)],
        );
        artistIds.push(artistResult.insertIndex);
      }
    }
    const [trackExists] = await connection.query(
      'SELECT COUNT(*) AS count FROM tracks WHERE trackKey = ?',
      [track.trackKey],
    );
    if (trackExists[0].count > 0) {
      winLogger.warn('Track already exists', { track });
      await connection.rollback();
      return;
    }

    const [trackResult] = await connection.query(
      'INSERT INTO tracks (trackKey, titleKeyword, releaseDate, platforms, trackImages, thumbnails, lyrics) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        track.trackKey,
        track.titleKeyword,
        toMysqlFormat(track.releaseDate),
        JSON.stringify(track.platforms),
        JSON.stringify(track.trackImages),
        JSON.stringify(track.thumbnails),
        track.lyrics,
      ],
    );
    const trackId = trackResult.insertId;
    for await (const artistId of artistIds) {
      await connection.query(
        'INSERT INTO trackDetails (artistId, trackId) VALUES (?, ?)',
        [artistId, trackId],
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error; // Re-throw the error to be handled in the batch processing
  }
}

export default async function insertTracks(tracks) {
  winLogger.info('Start inserting tracks');
  for await (const track of tracks) {
    const connection = await pool.getConnection();
    try {
      await insertTrack(track, connection);
    } catch (error) {
      winLogger.error(error);
    } finally {
      connection.release();
    }
  }
  winLogger.info('Finished inserting tracks');
}
