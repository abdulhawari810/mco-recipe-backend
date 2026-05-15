import { Sequelize } from "sequelize";
import db from "../config/database.js";
import dotenv from "dotenv";

dotenv.config();

const { DataTypes } = Sequelize;

const CategoriesModels = db.define(
  "categories",
  {
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    desc: {
      type: DataTypes.STRING,
      defaultValue: "No Description.",
    },
  },
  {
    freezeTableName: true,
  },
);

export default CategoriesModels;
