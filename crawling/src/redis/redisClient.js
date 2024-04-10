import { createClient } from 'redis';

import config from '../../config/config';
import winLogger from '../util/winston';

const { socket } = config.redis;

const client = createClient({
  socket,
});
client.on('connect', () => winLogger.info('Redis connected!'));
await client.connect();

export default client;
