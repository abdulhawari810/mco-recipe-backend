import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const db = new Sequelize(
  process.env.APP_DATABASE,
  process.env.APP_USERNAME,
  process.env.APP_PASSWORD,
  {
    host: process.env.APP_HOST,
    dialect: "mysql",
  },
);

export default db;
