import mysql from 'mysql2/promise';

import config from '../../config/config.js';
import winLogger from '../util/winston.js';

const pool = mysql.createPool({ ...config.mysql });
export default pool;

export async function ping() {
  const conn = await pool.getConnection();
  await conn.ping().then(() => {
    winLogger.info('mysql ping ok');
    conn.release();
  });
}
