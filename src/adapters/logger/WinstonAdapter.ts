import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { ILoggerAdapter } from "./LoggerAdapter";

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

// Add colors to winston
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define Daily Rotate File transport for different log levels
const fileRotateTransport = new DailyRotateFile({
  filename: path.join("logs", "application-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  format: winston.format.combine(
    winston.format.uncolorize(),
    winston.format.json()
  ),
});

// Define Error Log transport
const errorRotateTransport = new DailyRotateFile({
  filename: path.join("logs", "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  level: "error",
  format: winston.format.combine(
    winston.format.uncolorize(),
    winston.format.json()
  ),
});

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  levels,
  format,
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    fileRotateTransport,
    errorRotateTransport,
  ],
});

export class WinstonAdapter implements ILoggerAdapter {
  private static instance: WinstonAdapter;
  private logger: winston.Logger;

  private constructor() {
    this.logger = logger;
  }

  public static getInstance(): WinstonAdapter {
    if (!WinstonAdapter.instance) {
      WinstonAdapter.instance = new WinstonAdapter();
    }
    return WinstonAdapter.instance;
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  http(message: string, meta?: any): void {
    this.logger.http(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }
}
