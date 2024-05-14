import integrateAllDomesticTracks from './src/services/integrate.js';
import loadToRedis from './src/services/loadToRedis.js';
import { validateDate } from './src/util/time.js';

const startDate = validateDate(process.argv[2]);
const endDate = validateDate(process.argv[3]);

await loadToRedis();
await integrateAllDomesticTracks(new Date(startDate), new Date(endDate), 'w');
process.exit();
