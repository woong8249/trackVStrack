/* eslint-disable no-restricted-syntax */
/* eslint-disable no-shadow */

import fs from 'fs';
import path from 'path';

import { extractYearMonthDay } from '../util/time';

import crawlingDomesticPlatformWeeklyCharts from './weeklyCrawling.js';

export default async function crawlingDomesticPlatformCharts(startDate, endDate, chartType) {
  const fileName = Object.values(extractYearMonthDay(startDate)).reduce((pre, cur) => pre + cur, '')
   + '-' + Object.values(extractYearMonthDay(endDate)).reduce((pre, cur) => pre + cur, '') + '-' + chartType;
  const filePath = path.join(__dirname, '../integrate/domestic/dataBeforeIntegration', `${fileName}.json`);
  const result = await crawlingDomesticPlatformWeeklyCharts(startDate, endDate, chartType);
  fs.writeFileSync(filePath, JSON.stringify(result));
  return result;
}
