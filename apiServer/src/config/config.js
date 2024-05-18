import winLogger from '../util/winston.js';

function required(key, defaultValue = undefined) {
  const value = import.meta.env?.[key] ?? process.env[key] ?? defaultValue;
  if (value === undefined)
    throw new Error(`config ${key} is undefined`);
  return value;
}

const config = {
  node: {
    nodeEnv: required('VITE_NODE_ENV', 'production'),
    nodePort: Number(required('VITE_NODE_PORT', 3000)),
  },
  mysql: {
    host: required('VITE_MYSQL_HOST'),
    port: required('VITE_MYSQL_PORT', 3306),
    user: required('VITE_MYSQL_USER'),
    password: required('VITE_MYSQL_PASSWORD', 123456789),
    database: required('VITE_MYSQL_DATABASE', 'chartchart'),
    waitForConnections: true,
    connectionLimit: Number(required('VITE_MYSQL_POOL_LIMIT', 10)),
  },
};
winLogger.info('config', { config });
export default config;
