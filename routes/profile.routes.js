import express from "express";
import {} from "../controllers/profil.controller.js";
import { verifyToken } from "../middleware/auth.js";
import {
  createProfile,
  getProfile,
  updateProfile,
} from "../controllers/profile.controller.js";

const ProfileRoutes = express.Router();

// GET: Get all recipes
ProfileRoutes.get("/", verifyToken, getProfile);
ProfileRoutes.post("/create", verifyToken, createProfile);
ProfileRoutes.patch("/update", verifyToken, updateProfile);

export default ProfileRoutes;
