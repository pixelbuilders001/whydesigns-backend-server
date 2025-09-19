const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: "localhost",
    dialect: "postgres",
    migrationStorage: "json",
    migrations: ["db/migrations"],
    models: ["db/models"],
  },
  test: {
    username: "root",
    password: null,
    database: "your_database_test",
    host: "127.0.0.1",
    dialect: "postgres",
  },
  production: {
    username: "root",
    password: null,
    database: "your_database_prod",
    host: "127.0.0.1",
    dialect: "postgres",
  },
};
