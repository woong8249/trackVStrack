import upsert from './src/services/upsert.js';
import { validateDate } from './src/util/time.js';

const startDate = validateDate(process.argv[2]);
const endDate = validateDate(process.argv[3]);
await upsert(new Date(startDate), new Date(endDate), 'w');
process.exit();
