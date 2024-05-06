import mysql from 'mysql2/promise';

import config from '../../config/config.js';

export default await mysql.createConnection({ ...config.mysql });
