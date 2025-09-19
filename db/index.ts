import { Sequelize } from "sequelize";
import { config } from "../src/config";

const sequelize = new Sequelize(
  config.db.DB_NAME,
  config.db.DB_USER_NAME,
  config.db.DB_PASSWORD,
  {
    host: config.db.DB_HOST,
    dialect: "postgres",
  }
);

export default sequelize;

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
  }
};
