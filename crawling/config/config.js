function required(key, defaultValue = undefined) {
  const value = import.meta.env?.[key] ?? process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`config ${key} is undefined`);
  }
  return value;
}

const config = {
  logLevel: required('VITE_LOG_LEVEL', 'info'),
  node: {
    nodeEnv: required('VITE_NODE_ENV', 'production'),
    nodePort: Number(required('VITE_NODE_PORT')),
  },
  spotify: {
    clientID: required('VITE_SPOTIFY_CLIENT_ID'),
    clientSecret: required('VITE_SPOTIFY_CLIENT_SECRET'),
  },
  redis: {
    socket: {
      port: required('VITE_REDIS_SOCKET_PORT', 6379),
      host: required('VITE_REDIS_SOCKET_HOST', 'redis'),
    },
  },
  mysql: {
    host: required('VITE_MYSQL_HOST', 'mysql'),
    password: required('VITE_MYSQL_PASSWORD', 123456789),
    user: required('VITE_MYSQL_USER', 'production'),
    database: required('VITE_MYSQL_DATABASE', 'chartchart'),
    port: required('VITE_MYSQL_PORT', 3306),
    waitForConnections: true,
    connectionLimit: parseInt(required('VITE_MYSQL_POOL_LIMIT'), 10),
  },
};

export default config;
