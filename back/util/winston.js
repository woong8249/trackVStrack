import { createLogger, format, transports } from 'winston';
import { consoleFormat } from 'winston-console-format';

const winLogger = createLogger({
  level: 'info',
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
