import path from 'path';

import createTable, { doesTableHaveData } from '../mysql/createTables';
import insertTracks from '../mysql/insertData';
import { integrateJSONFiles } from '../integrate/domestic/integrate';
import winLogger from '../util/winston';

export default async function migrate() {
  await createTable();
  const result = await doesTableHaveData();
  if (result) {
    winLogger.warn('Please empty all table information.');
  }
  const dirPath = path.join(__dirname, '../integrate/domestic/dataAfterIntegration');
  const tracks = integrateJSONFiles(dirPath);
  await insertTracks(tracks);
}
