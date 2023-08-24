import pino from 'pino';
import pretty from 'pino-pretty';

const isTest = process.env.NODE_ENV === 'test';
const isDev = process.env.NODE_ENV === 'development';

export const logger = pino(
  {
    customLevels: {
      log: 30,
    },
    level: isDev ? 'trace' : isTest ? 'warn' : 'info',
    redact: {
      paths: ['req'],
      remove: true,
    },
    sync: isTest,
  },
  pretty({
    colorize: true,
    levelFirst: true,
  }),
);
