import { Sequelize } from "sequelize";
import db from "../config/database.js";
import dotenv from "dotenv";

dotenv.config();

const { DataTypes } = Sequelize;

const RecipeModels = db.define(
  "recipes",
  {
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ingredients: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "categories",
        key: "id",
      },
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    time: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("draft", "pending", "reject", "accept"),
      defaultValue: "pending",
      allowNull: false,
      validate: {
        isIn: [["draft", "pending", "reject", "accept"]],
      },
    },
  },
  {
    freezeTableName: true,
  },
);

export default RecipeModels;
