import process from 'node:process';

import migrate from './src/services/migrate';
import redisClient from './src/redis/redisClient';

await migrate();
await redisClient.disconnect();
process.exit();
