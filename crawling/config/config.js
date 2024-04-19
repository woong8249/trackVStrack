import winLogger from '../src/util/winston';

function required(key, defaultValue = undefined) {
  const value = import.meta.env?.[key] ?? process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`config ${key} is undefined`);
  }
  return value;
}

const config = {
  node: {
    nodeEnv: required('VITE_NODE_ENV'),
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
};

winLogger.info('config', { config });
export default config;
