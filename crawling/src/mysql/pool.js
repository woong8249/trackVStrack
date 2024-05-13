import mysql from 'mysql2/promise';

import config from '../../config/config.js';

const pool = mysql.createPool({ ...config.mysql });
export default pool;
