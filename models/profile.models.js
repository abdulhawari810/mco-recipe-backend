import { Sequelize } from "sequelize";
import db from "../config/database.js";
import dotenv from "dotenv";

dotenv.config();

const { DataTypes } = Sequelize;

const ProfileModels = db.define(
  "profile_information",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    phone: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("male", "female"),
      allowNull: true,
    },
    preference_food: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alergi_food: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    skill: {
      type: DataTypes.ENUM("beginner", "intermediate", "expert"),
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  },
);

export default ProfileModels;
