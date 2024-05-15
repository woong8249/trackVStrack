import upsert from './src/services/upsert.js';
import { validateDate } from './src/util/time.js';

// 전제조건 DB에 과거 모든정보가 있어야함

const startDate = validateDate(process.argv[2]);
const endDate = validateDate(process.argv[3]);
await upsert(new Date(startDate), new Date(endDate), 'w');
process.exit();
