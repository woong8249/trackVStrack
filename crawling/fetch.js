import collectWeeklyCharts from './src/services/fetch.js';
import { validateDate } from './src/util/time.js';

const startDate = validateDate(process.argv[2]);
const endDate = validateDate(process.argv[3]);

await collectWeeklyCharts(new Date(startDate), new Date(endDate), 'w');
process.exit();
