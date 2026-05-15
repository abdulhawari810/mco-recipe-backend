import express from "express";
import { login, register, me, logout } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.js";

const AuthRoute = express.Router();

// POST: Register user baru
AuthRoute.post("/register", register);

// POST: Login user
AuthRoute.post("/login", login);

// GET: Get user
AuthRoute.get("/me", verifyToken, me);

// DELETE: Logout user
AuthRoute.delete("/logout", verifyToken, logout);

export default AuthRoute;
