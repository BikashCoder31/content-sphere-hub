import pino from 'pino';
import { config } from './index.js';

type PinoType = typeof pino;
const pinoFn = pino as unknown as PinoType;

const transport =
  config.logging.format === 'pretty' && config.env !== 'production'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined;

export const logger = pinoFn({
  level: config.logging.level,
  transport,
  base: {
    env: config.env,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
