/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import path from 'path';

import flushAllRedisData from './src/redis/flushAllRedisData.js';
import { formatDates } from './src/util/time.js';
import integrateAllDomesticTracks from './src/services/integrate.js';
import migrate from './src/services/migrate.js';
import winLogger from './src/util/winston.js';

await flushAllRedisData();
const dirPath = path.join(__dirname, 'src/integrate/domestic/dataBeforeIntegration');
const days = fs.readdirSync(dirPath).map(item => formatDates(item));

for await (const day of days) {
  const startDate = new Date(day[0]);
  const endDate = new Date(day[1]);
  await integrateAllDomesticTracks(startDate, endDate, 'w');
  winLogger.info('integrate done.', { startDate, endDate });
}
winLogger.info('integrate all done.');
await flushAllRedisData();
await migrate();
process.exit();
