/* eslint-disable no-restricted-syntax */
import path from 'path';

import createTable from '../mysql/createTables';
import insertTracks from '../mysql/insertData';
import { integrateJSONFiles } from '../integrate/domestic/integrate';
import pool from '../mysql/pool';
import winLogger from '../util/winston';

export default async function migrate() {
  const tableNames = ['tracks', 'trackDetails', 'artists'];
  const conn = await pool.getConnection();
  await conn.ping().then(() => winLogger.info('mysql ping ok'));
  await createTable();
  for await (const tableName of tableNames) {
    const result = await conn.query(`select * from ${tableName}`);
    if (result[0].length !== 0) {
      throw new Error('Table already has data');
    }
  }
  conn.release();
  const dirPath = path.join(__dirname, '../integrate/domestic/dataAfterIntegration');
  const tracks = integrateJSONFiles(dirPath);
  await insertTracks(tracks);
}
