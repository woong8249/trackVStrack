import { createClient } from 'redis';

import config from '../../config/config';
import winLogger from '../util/winston';

const { socket } = config.redis;

const redisClient = createClient({
  socket,
});
redisClient.on('connect', () => winLogger.info('Redis connected!'));
await redisClient.connect();

export default redisClient;
