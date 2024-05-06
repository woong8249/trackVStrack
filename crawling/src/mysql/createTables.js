/* eslint-disable no-restricted-syntax */
import fs from 'fs/promises';
import path from 'path';

import winLogger from '../util/winston.js';

import client from './client.js';
// 위에서 만든 client을 import

export default async function createTable() {
  const fullPath = path.join(__dirname, 'createTables.sql');
  const sqlContent = await fs.readFile(fullPath, 'utf8');
  const queries = sqlContent.split(';').map(query => query.trim()).filter(query => query.length);

  await Promise.all(queries.map(async query => {
    await client.query(query).then(result => winLogger.info('Query executed successfully', { query, result }));
  }));
}
