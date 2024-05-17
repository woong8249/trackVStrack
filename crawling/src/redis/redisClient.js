import { createClient } from 'redis';

import config from '../../config/config.js';
import winLogger from '../util/winston.js';

const { socket } = config.redis;

const redisClient = createClient({
  socket,
});
redisClient.on('connect', () => winLogger.info('Redis connected!'));
redisClient.on('end', () => winLogger.info('Redis client disconnected!'));
await redisClient.connect();

export default redisClient;
