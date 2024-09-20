import { createLogger, format, transports } from 'winston';
import { consoleFormat } from 'winston-console-format';

import config from '../config/config';

const { logLevel } = config.app;

const winLogger = createLogger({
  level: logLevel,
  format: format.combine(
    format.errors({ stack: true }),
    format.splat(),
  ),
  transports: [
    new transports.Console({
      handleExceptions: true,
      format: format.combine(
        format.colorize({ all: true }),
        format.padLevels(),
        consoleFormat({
          showMeta: true,
          metaStrip: ['timestamp', 'service'],
          inspectOptions: {
            depth: Infinity,
            colors: true,
            maxArrayLength: Infinity,
            breakLength: 120,
            compact: Infinity,
          },
        }),
      ),
    }),
  ],
});

export default winLogger;
