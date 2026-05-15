import express from "express";

import {
  createAllUsers,
  createUsers,
  deleteUsers,
  getUsers,
  getUsersById,
  updateUsers,
  updateStatusUsers,
} from "../controllers/users.controllers.js";
import { verifyAdmin, verifyToken } from "../middleware/auth.js";

const UsersRoute = express.Router();

UsersRoute.get("/", verifyToken, verifyAdmin, getUsers);
UsersRoute.get("/find/:id", verifyToken, verifyAdmin, getUsersById);
UsersRoute.patch("/update/:id", verifyToken, verifyAdmin, updateUsers);
UsersRoute.post("/create", verifyToken, verifyAdmin, createUsers);
UsersRoute.post("/create/all", verifyToken, verifyAdmin, createAllUsers);
UsersRoute.post(
  "/update/status/:id",
  verifyToken,
  verifyAdmin,
  updateStatusUsers,
);
UsersRoute.delete("/delete/:id", verifyToken, verifyAdmin, deleteUsers);

export default UsersRoute;
