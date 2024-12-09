/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import path from 'path';
import createDataSource from '../typeorm/dataSource';
import type { TrackFormatWithAddInfo } from '../types/processing';
import winLogger from '../logger/winston';
import { findAllJsonFilePaths } from '../util/json';
import { resolveArtists, insertTrack } from '../processing/insert';

const dataSource = await createDataSource();

export async function insertTrackSAndArtists(tracksData: TrackFormatWithAddInfo[], totalTracks: number, processedCountRef: { count: number }) {
  for (const trackData of tracksData) {
    await dataSource.manager.transaction(async (transactionalEntityManager) => {
      const resolvedArtists = await resolveArtists(trackData, transactionalEntityManager);
      await insertTrack(trackData, resolvedArtists, transactionalEntityManager);

      processedCountRef.count += 1; // 참조 타입으로 처리된 개수를 증가
      const progress = ((processedCountRef.count / totalTracks) * 100).toFixed(2);
      winLogger.debug(`Progress: ${progress}% (${processedCountRef.count}/${totalTracks}) tracks processed.`);
    });
  }
}

export async function insertAllTrackSAndArtists() {
  const directoryPath = path.join(__dirname, '../../data');
  const tracksDataArray = findAllJsonFilePaths(directoryPath).map((filePath) => {
    const data = fs.readFileSync(filePath, 'utf8');
    return (JSON.parse(data) as TrackFormatWithAddInfo[]);
  });

  const totalTracks = tracksDataArray.reduce((acc, tracksData) => acc + tracksData.length, 0); // 전체 트랙 수 계산
  const processedCountRef = { count: 0 }; // 처리된 트랙 수를 참조 타입으로 저장

  for await (const tracksData of tracksDataArray) {
    await insertTrackSAndArtists(tracksData, totalTracks, processedCountRef);
  }

  await dataSource.destroy();
  winLogger.info('All tracks processed. Done.');
}
