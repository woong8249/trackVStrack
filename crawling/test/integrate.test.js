/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */

// import {
//   describe,
//   expect, it,
// } from 'vitest';
// import ss from 'string-similarity';

import { crawlingDomesticPlatformCharts, integrateAllDomesticTracks } from '../src/services/collectData.js';
import flushAllRedisData from '../src/redis/flushAllRedisData.js';
// import jsonFIle from '../src/dataCollecting/domestic/dataAfterIntegration/20230102-20231231-w.json';

// Object.entries(jsonFIle).forEach(([key, value]) => {
//   if (key.split('/')[2] > 0) {
//     console.log(value);
//   }
// });

// 1.  분류된곡의 경우 무조건 같은 가사를 가졌을 것이다.
// 2.  만약 artistKeyword가 같다면 무조건 id는 같을 것이다.

await flushAllRedisData();
const startDate = new Date('2023-01-02');
const endDate = new Date('2023-12-31');
const chartType = 'w';

// // await crawlingDomesticPlatformCharts(startDate, endDate, chartType);
await integrateAllDomesticTracks(startDate, endDate, chartType);
