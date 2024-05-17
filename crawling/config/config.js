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
    nodeEnv: required('VITE_NODE_ENV'),
    nodePort: Number(required('VITE_NODE_PORT')),
  },
  redis: {
    socket: {
      port: required('VITE_REDIS_SOCKET_PORT'),
      host: required('VITE_REDIS_SOCKET_HOST'),
    },
  },
  mysql: {
    host: required('VITE_MYSQL_HOST'),
    password: required('VITE_MYSQL_PASSWORD'),
    user: required('VITE_MYSQL_USER'),
    database: required('VITE_MYSQL_DATABASE'),
    port: required('VITE_MYSQL_PORT'),
    connectionLimit: Number(required('VITE_MYSQL_POOL_LIMIT')),
    waitForConnections: true,
  },
};

export default config;
