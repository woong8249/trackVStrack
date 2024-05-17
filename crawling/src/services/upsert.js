import fs from 'fs';
import path from 'path';

import { doesTableHaveData } from '../mysql/createTables';
import { extractYearMonthDay } from '../util/time';
import { getArtistsNoHasAddInfo } from '../mysql/getAllData';
import updateArtistsAddInfoBulk from '../mysql/updateArtist';
import upsertTracksAndArtists from '../mysql/upsert';
import winLogger from '../util/winston';

import { fetchArtistsInfo } from './fetch';

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

//  가끔 호출 해주면 갱신되지않을까..
export async function updateArtistAddInfo() {
  const artists = await getArtistsNoHasAddInfo();
  winLogger.info('Number of artists without additional information', { numberOfArtists: artists.length });
  const result = await fetchArtistsInfo(artists);
  await updateArtistsAddInfoBulk(result);
}

await updateArtistAddInfo();
