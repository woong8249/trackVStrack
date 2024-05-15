import flushAllRedisData from './src/redis/flushAllRedisData.js';
import integrateAllDomesticTracks from './src/services/integrate.js';
import loadToRedis from './src/services/loadToRedis.js';
import { validateDate } from './src/util/time.js';
import winLogger from './src/util/winston.js';

// 해당 파일의 실행전제조건
// DB에서 Redis로 Key정보를 가져온경우임
// 떄문에 단일 파일별로 실행하는경우는  모든 정보가 DB에 다 들어가 있을떄임
const startDate = validateDate(process.argv[2]);
const endDate = validateDate(process.argv[3]);

await flushAllRedisData();
await loadToRedis();
await integrateAllDomesticTracks(new Date(startDate), new Date(endDate), 'w');
winLogger.info('integrate done.');
process.exit();
