"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Function to recursively read models from subdirectories
const loadModels = (directory) => {
  fs.readdirSync(directory).forEach((file) => {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      loadModels(fullPath); // Recursively load models from subdirectories
    } else if (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".ts" && // Change ".js" to ".ts" since you use TypeScript
      file.indexOf(".test.ts") === -1
    ) {
      const model = require(fullPath)(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    }
  });
};

// Load models from the root and subdirectories
loadModels(__dirname);

// Setup associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
