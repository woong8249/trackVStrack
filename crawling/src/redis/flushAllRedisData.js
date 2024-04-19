/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import winLogger from '../util/winston';

import redisClient from './redisClient';

export default async function flushAllRedisData() {
  try {
    const allKeys = await redisClient.keys('*');

    // Redis 해시 및 집합 초기화
    for (const key of allKeys) {
      const type = await redisClient.type(key);
      if (type === 'hash' || type === 'set') {
        await redisClient.del(key); // 해시 또는 집합 키 삭제
      }
    }
    winLogger.info('All Redis data flushed.');
  } catch (error) {
    winLogger.error(error);
  }
}
