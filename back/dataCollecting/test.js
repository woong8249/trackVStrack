import fs from 'fs/promises';

// import * as bugs from './bugs.js';
// import * as genie from './genie.js';
import * as melon from './melon.js';

const melonWeeklyChart = await melon.fetchChartsForDateRangeInParallel(new Date('2019-02-01'), new Date('2020-02-01'), 'WE', 30);
fs.writeFile('./genieWeeklyChart.json', JSON.stringify(melonWeeklyChart));
