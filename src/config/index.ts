import dotenv from "dotenv";

dotenv.config({ path: ".env" });

export const config = {
  ENV: "development",
  PORT: process.env.PORT || 8080,
  HOST: process.env.HOST || "localhost",
  ORIGIN: process.env.ORIGIN || "http://localhost:8080",
  db: {
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_USER_NAME: process.env.DB_USERNAME || "postgres",
    DB_PASSWORD: process.env.DB_PASSWORD || "password",
    DB_NAME: process.env.DB_NAME || "postgres",
    DB_PORT: process.env.DB_PORT || "5432",
  },
  CACHE_PROVIDER: process.env.CACHE_PROVIDER || "redis",
  cache: {
    redis: {
      PORT: process.env.REDIS_PORT || "6379",
      HOST: process.env.REDIS_HOST || "localhost",
      AUTH: process.env.REDIS_PASSWORD || "",
    },
    CACHE_EXPIRE_TIME: process.env.CACHE_EXPIRE_TIME || 5 * 60 * 1000,
  },
  auth: {
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET_KEY || "access_secret",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET_KEY || "refresh_secret",
  },
  mail: {
    MAIL_FROM: process.env.MAIL_FROM || "",
    MAIL_PROVIDER: process.env.MAIL_PROVIDER || "ses",
  },
  aws: {
    AWS_REGION: process.env.AWS_REGION || "us-east-1",
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  nodemailer: {
    SMTP_HOST: process.env.SMTP_HOST || "localhost",
    SMTP_PORT: process.env.SMTP_PORT || "5432",
    SMTP_USER: process.env.SMTP_USER || "",
    SMTP_PASS: process.env.SMTP_PASS || "",
    MAIL_FROM: process.env.MAIL_FROM || "",
  },
  s3: {
    bucketName: process.env.AWS_S3_BUCKET_NAME || "",
    // Prefer a dedicated S3 region var to avoid conflicts with global AWS_REGION (used by other AWS services)
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID! || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! || "",
    },
  },
  logger: {
    LOG_PROVIDER: process.env.LOG_PROVIDER || "winston",
  },
  otp: {
    EXPIRE_TIME: process.env.OTP_EXPIRE_TIME || 60 * 5 * 1000,
    LENGTH: process.env.OTP_LENGTH || 4,
  },
};
