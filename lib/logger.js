const { get, pick, toUpper } = require('lodash');
const winston = require('winston');

function createLogger({ config }) {
  const logger = winston.createLogger({
    transports: [
      new winston.transports.File({
        filename: `${Date.now()}.log`,
        handleExceptions: true,
        level: 'silly',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.splat(),
          winston.format.printf(info => JSON.stringify(info, (key, value) => {
            if (value instanceof Error) {
              return pick(value, Object.getOwnPropertyNames(value));
            }

            return value;
          })),
        ),
      }),
      new winston.transports.Console({
        handleExceptions: true,
        level: get(config, 'logger.level', 'info'),
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.splat(),
          winston.format.printf(info => `[${info.timestamp}] ${toUpper(info.level)}: ${info.message}`),
        ),
      }),
    ],
  });

  process.on('unhandledRejection', (error) => {
    logger.error(error.message, { error });
  });

  return logger;
}

module.exports = createLogger;
