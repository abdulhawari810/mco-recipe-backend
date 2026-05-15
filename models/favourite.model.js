import { Sequelize } from "sequelize";
import db from "../config/database.js";
import dotenv from "dotenv";

dotenv.config();

const { DataTypes } = Sequelize;

const FavouriteModels = db.define(
  "favourite",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    recipeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "recipes",
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
  },
);

export default FavouriteModels;
