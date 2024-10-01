/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import path from 'path';
import createDataSource from '../typeorm/dataSource';
import type { TrackFormatWithAddInfo } from '../types/processing';
import winLogger from '../logger/winston';
import { getAllJsonFiles } from '../util/json';
import { resolveArtists, insertTrack } from '../processing/insert';

const dataSource = await createDataSource();

export async function insertTrackSAndArtists() {
  const directoryPath = path.join(__dirname, '../../data');
  const tracksDataArray = getAllJsonFiles(directoryPath).map((filePath) => {
    const data = fs.readFileSync(filePath, 'utf8');
    return (JSON.parse(data) as TrackFormatWithAddInfo[]);
  }).slice(4, 5);

  const total = tracksDataArray.reduce((total, tracksData) => total + tracksData.length, 0);
  let processedTask = 0; //

  await (async () => {
    for (const tracksData of tracksDataArray.slice(-100)) {
      for (const trackData of tracksData) {
        await dataSource.manager.transaction(async (transactionalEntityManager) => {
          const resolvedArtists = await resolveArtists(trackData, transactionalEntityManager);
          await insertTrack(trackData, resolvedArtists, transactionalEntityManager);
          processedTask += 1;
          const progress = ((processedTask / total) * 100).toFixed(2);
          winLogger.debug(`Progress: ${processedTask.toString()}/${total.toString()} (${progress}%) completed.`);
        });
      }
    }
  })();
  await dataSource.destroy();
  winLogger.info('All tracks processed. Done.');
}
