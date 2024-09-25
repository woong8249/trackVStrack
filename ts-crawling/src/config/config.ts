function required(key: string, defaultValue: undefined | string | number): string | number {
  const value: undefined | string | number = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`config ${key} is  undefined`);
  }
  if (typeof value === 'number') {
    return value;
  }
  const num = Number(value);
  if (typeof value === 'string') {
    if (Number.isNaN(num)) { return value; }
  }
  return num;
}

const config = {
  app: {
    logLevel: required('VITE_APP_LEVEL', 'debug') as string,
    env: required('VITE_APP_ENV', 'production') as string,
    port: Number(required('VITE_APP_PORT', '3000')),
  },
  // redis: {
  //   socket: {
  //     port: required('VITE_REDIS_SOCKET_PORT', undefined),
  //     host: required('VITE_REDIS_SOCKET_HOST', undefined),
  //   },
  // },
  // mysql: {
  //   host: required('VITE_MYSQL_HOST', undefined),
  //   password: required('VITE_MYSQL_PASSWORD', undefined),
  //   user: required('VITE_MYSQL_USER', undefined),
  //   database: required('VITE_MYSQL_DATABASE', undefined),
  //   port: required('VITE_MYSQL_PORT', undefined),
  //   connectionLimit: Number(required('VITE_MYSQL_POOL_LIMIT', undefined)),
  //   waitForConnections: true,
  // },
};

export default config;
