import { ApolloServerErrorCode } from "@apollo/server/dist/esm/errors";
import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "graphql-pets" },
  transports: [
    //
    // - Write all logs with importance level of `error` or higher to `error.log`
    //   (i.e., error, fatal, but not other levels)
    //
    new winston.transports.File({
      filename: "./logs/error.log",
      level: "error",
    }),
    //
    // - Write all logs with importance level of `info` or higher to `combined.log`
    //   (i.e., fatal, error, warn, and info, but not trace)
    //
    new winston.transports.File({ filename: "./logs/combined.log" }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export const loggerPluggin = {
  async requestDidStart(requestContext) {
    const start = Date.now();

    const operationName = requestContext.request.operationName;

    return {
      async didResolveOperation(ctx) {
        logger.info(`Operation [${operationName}] resolved`);
      },
      async willSendResponse() {
        const duration = Date.now() - start;

        logger.info(
          `Operation [${operationName}]` + ` completed in [${duration}ms]`
        );
      },
    };
  },
};
