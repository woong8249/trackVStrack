import winLogger from '../../util/winston';

export default function gracefulShutdown(server) {
  server.close(() => {
    winLogger.info('Server is gracefully ShutDowned..', { serverAddress: server.address() });
  });
}
