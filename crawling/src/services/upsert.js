import fs from 'fs';
import path from 'path';

import { doesTableHaveData } from '../mysql/createTables';
import { extractYearMonthDay } from '../util/time';
import upsertTracksAndArtists from '../mysql/upsert';
import winLogger from '../util/winston';

export default async function upsert(startDate, endDay, chartType) {
  const result = await doesTableHaveData();
  if (!result) {
    winLogger.warn('Please check table Info.');
    return;
  }
  const fileName = Object.values(extractYearMonthDay(startDate)).reduce((pre, cur) => pre + cur, '')
    + '-' + Object.values(extractYearMonthDay(endDay)).reduce((pre, cur) => pre + cur, '') + '-' + chartType + '.json';
  const pathName = path.join(__dirname, '../integrate/domestic/dataAfterIntegration', fileName);
  const tracks = Object.values(JSON.parse(fs.readFileSync(pathName)));
  await upsertTracksAndArtists(tracks);
}
