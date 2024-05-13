/* eslint-disable no-restricted-syntax */
import crawlingDomesticPlatformCharts from './src/services/integrate.js';
import flushAllRedisData from './src/redis/flushAllRedisData.js';
import redisClient from './src/redis/redisClient.js';
import winLogger from './src/util/winston.js';

const dateRanges = [
  { start: '2024-01-01', end: '2024-05-05' },
  { start: '2023-01-02', end: '2023-12-31' },
  { start: '2022-01-03', end: '2023-01-01' },
  { start: '2021-01-04', end: '2022-01-02' },
  { start: '2019-12-30', end: '2021-01-03' },
  { start: '2018-12-31', end: '2019-12-29' },
];

await flushAllRedisData();
for await (const range of dateRanges) {
  await crawlingDomesticPlatformCharts(new Date(range.start), new Date(range.end), 'w');
  winLogger.info('integrate done', { range });
}

winLogger.info('all done..');
await redisClient.disconnect();
