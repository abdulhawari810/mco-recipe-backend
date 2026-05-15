import { Sequelize } from "sequelize";
import db from "../config/database.js";
import dotenv from "dotenv";

dotenv.config();

const { DataTypes } = Sequelize;

const UsersModels = db.define(
  "users",
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Username tidak boleh kosong!",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Alamat Email tidak boleh kosong!",
        },
        isEmail: {
          msg: "Alamat Email tidak valid!",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Password tidak boleh kosong!",
        },
      },
    },
    profile: {
      type: DataTypes.STRING,
      defaultValue: "default.png",
    },
    role: {
      type: DataTypes.ENUM("admin", "chief", "users"),
      defaultValue: "users",
    },
    is_active: {
      type: DataTypes.ENUM("active", "in_active", "banned"),
      defaultValue: "active",
    },
    is_verified: {
      type: DataTypes.ENUM("verified", "in_verified"),
      defaultValue: "in_verified",
    },
  },
  {
    freezeTableName: true,
  },
);

export default UsersModels;
