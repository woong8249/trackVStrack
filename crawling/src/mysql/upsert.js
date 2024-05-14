/* eslint-disable no-restricted-syntax */
import { toMysqlFormat } from '../util/time.js';
import winLogger from '../util/winston.js';

import pool from './pool.js';

export default async function upsertTracksAndArtists(tracks) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for await (const track of tracks) {
      // 아티스트 삽입 또는 업데이트
      for await (const artist of track.artists) {
        const sql = `
                    INSERT INTO artists (artistKey, artistKeyword, platforms)
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE platforms = JSON_MERGE_PRESERVE(platforms, VALUES(platforms));
                `;
        await connection.query(sql, [artist.artistKey, artist.artistKeyword, JSON.stringify(artist.platforms)]);
      }

      // ------------------------------
      // 트랙 삽입 또는 업데이트
      let sql = `
                INSERT INTO tracks (trackKey, titleKeyword, releaseDate, platforms, trackImages, thumbnails, lyrics)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    platforms = JSON_MERGE_PRESERVE(platforms, VALUES(platforms))
            `;
      await connection.query(sql, [
        track.trackKey,
        track.titleKeyword,
        toMysqlFormat(track.releaseDate),
        JSON.stringify(track.platforms),
        JSON.stringify(track.trackImages),
        JSON.stringify(track.thumbnails),
        track.lyrics,
      ]);

      // 트랙과 아티스트의 관계 삽입 또는 업데이트
      for await (const artist of track.artists) {
        sql = `
        INSERT IGNORE INTO trackDetails (artistId, trackId)
        SELECT a.id, t.id
        FROM artists a, tracks t
        WHERE a.artistKey = ? AND t.trackKey = ?
                `;
        await connection.query(sql, [artist.artistKey, track.trackKey]);
      }
    }

    await connection.commit(); // 트랜잭션 커밋
  } catch (error) {
    await connection.rollback(); // 에러 발생 시 롤백
    console.error('Error during processing:', error);
  } finally {
    connection.release(); // 커넥션 반환
  }
  winLogger.info('upsertTracksAndArtists done');
}
