import path from 'path';
import fs from 'fs';
import { createLogger, format, transports } from 'winston';
import { consoleFormat } from 'winston-console-format';

import config from '../config/config';

const { logLevel } = config.app;

const logDir = path.join(__dirname, '../../log');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const errorLogPath = path.join(logDir, `${new Date().toISOString()}.log`);

const winLogger = createLogger({
  level: logLevel,
  format: format.combine(
    format.errors({ stack: true, exitOnError: true }),
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
            depth: 13,
            colors: true,
            maxArrayLength: Infinity,
            breakLength: 120,
            compact: Infinity,
          },
        }),
      ),
    }),
    new transports.File({
      filename: errorLogPath,
      level: 'error', // 'error' 레벨 이상만 파일에 기록
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.json(), // JSON 형식으로 기록
      ),
    }),
  ],
});

export default winLogger;
