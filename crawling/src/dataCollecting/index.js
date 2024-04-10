/* eslint-disable no-await-in-loop */
import { join, resolve } from 'path';
import { writeFile } from 'fs/promises';

// import * as bugs from './bugs.js';
import * as melon from './melon.js';
import * as genie from './genie.js';

// for (let year = 2010; year <= 2013; year += 1) {
//   const startDate = new Date(`${year}-01-01`);
//   const endDate = new Date(`${year}-12-31`);
//   const path = join(resolve() + `../../../legacy/bugs/dailyChart${year}.json`);
//   await bugs.fetchChartsForDateRangeInParallel(startDate, endDate, 'day', 10)
//   // eslint-disable-next-line require-await
//     .then(async res => {
//       const json = JSON.stringify(res, null, 2);
//       await writeFile(path, json);
//     })
//     .catch(err => { console.error(err); });
// }

// Melon Weekly Charat--------------
const melonWeekStartDate = new Date('2010-01-03');
const melonWeekEndDate = new Date('2024-03-31');
const melonWeeklyPath = join(resolve() + '../../../legacy/melon/weeklyChart20100103-20240331.json');
await melon.fetchChartsForDateRangeInParallel(melonWeekStartDate, melonWeekEndDate, 'WE', 10)
  .then(async res => {
    const json = JSON.stringify(res, null, 2);
    await writeFile(melonWeeklyPath, json);
  })
  .catch(err => { console.error(err); });

// Melon Weekly Charat--------------
const melonMonthlyStartDate = new Date('2010-01-01');
const melonMonthlyEndDate = new Date('2024-03-31');
const melonMonthlyPath = join(resolve() + '../../../legacy/melon/weeklyChart20100101-20240331.json');
await melon.fetchChartsForDateRangeInParallel(melonMonthlyStartDate, melonMonthlyEndDate, 'WE', 10)
  .then(async res => {
    const json = JSON.stringify(res, null, 2);
    await writeFile(melonMonthlyPath, json);
  })
  .catch(err => { console.error(err); });

// Genie DailyChart-----------------
for (let year = 2012; year <= 2024; year += 1) {
  const startDate = new Date(`${year}-03-28`);
  const endDate = new Date(`${year}-03-31`);
  const path = join(resolve() + `../../../legacy/genie/daily/dailyChart${year}.json`);
  await genie.fetchChartsForDateRangeInParallel(startDate, endDate, 'D', 10)
  // eslint-disable-next-line require-await
    .then(async res => {
      const json = JSON.stringify(res, null, 2);
      await writeFile(path, json);
    })
    .catch(err => { console.error(err); });
}

// Genie WeeklyChart----------------
const genieWeekStartDate = new Date('2012-03-25');
const genieWeekEndDate = new Date('2024-03-31');
const genieWeeklyPath = join(resolve() + '../../../legacy/genie/weeklyChart20120325-20240331.json');
await genie.fetchChartsForDateRangeInParallel(genieWeekStartDate, genieWeekEndDate, 'W', 10)
  .then(async res => {
    const json = JSON.stringify(res, null, 2);
    await writeFile(genieWeeklyPath, json);
  })
  .catch(err => { console.error(err); });

// Genie MonthlyChart----------------
const genieMonthStartDate = new Date('2012-02-01');
const genieMonthEndDate = new Date('2024-03-01');
const genieMonthlyPath = join(resolve() + '../../../legacy/genie/monthlyChart20120325-20240331.json');
await genie.fetchChartsForDateRangeInParallel(genieMonthStartDate, genieMonthEndDate, 'M', 10)
  .then(async res => {
    const json = JSON.stringify(res, null, 2);
    await writeFile(genieMonthlyPath, json);
  })
  .catch(err => { console.error(err); });
