import { validateCommand, validateDate } from './src/util/typeChecker';
import { fetchWeeklyCharts } from './src/service/fetchChart';
import fs from 'fs';
import path from 'path';
import type { TrackFormatWithoutAddInfo } from 'src/types/processing';
import type { PlatformName } from 'src/types/common';
import { processTracksAndArtists } from 'src/service/insert';

const command = validateCommand(process.argv[2]);

if (command === 'fetch') {
// pnpm run fetch 2012-12-31  2014-01-05 => 2013
// pnpm run fetch 2014-01-06  2015-01-04 => 2014
// pnpm run fetch 2015-01-05  2016-01-03 => 2015
// pnpm run fetch 2016-01-04  2017-01-01 => 2016
// pnpm run fetch 2017-01-02  2017-12-31 => 2017
// pnpm run fetch 2018-01-01  2018-12-30 => 2018
// pnpm run fetch 2018-12-31  2019-12-29 => 2019
// pnpm run fetch 2019-12-30  2020-12-27 => 2020
// pnpm run fetch 2020-12-28  2021-12-26 => 2021
// pnpm run fetch 2021-12-27  2022-12-25 => 2022
// pnpm run fetch 2022-12-26  2023-12-31 => 2023
  const startDate = validateDate(process.argv[3]);
  const endDate = validateDate(process.argv[4]);
  const startDateString = (startDate.toISOString().split('T')[0] as string).split('-').join('');
  const endDateString = (endDate.toISOString().split('T')[0] as string).split('-').join('');

  const dirPath = path.join(__dirname, `data/${startDateString}-${endDateString}-w`);

  const results = await fetchWeeklyCharts(startDate, endDate);
  fs.mkdirSync(dirPath, { recursive: true });
  results.forEach((result) => {
    const platformName = Object.keys(result[0] as unknown as TrackFormatWithoutAddInfo).find((key) => key !== 'trackKeyword') as PlatformName;
    const fileName = `${platformName}.json`;
    fs.writeFileSync(path.join(dirPath, fileName), JSON.stringify(result));
  });
} else if (command === 'insert') {
  await processTracksAndArtists();
}
