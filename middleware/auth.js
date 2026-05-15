import jwt from "jsonwebtoken";
import UsersModels from "../models/users.model.js";
import { success, error } from "../utils/response.utils.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    const token =
      req.cookies?.AccessToken ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null);

    if (!token) {
      return error(res, 401, "Access denied. No token provided.");
    }

    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = await UsersModels.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });
    next();
  } catch (errors) {
    if (errors.name === "TokenExpiredError") {
      return error(res, 401, "Token expired", errors.message);
    }
    console.error(errors);

    return error(res, 403, "Token tidak valid", errors.message);
  }
};

export const verifyAdmin = async (req, res, next) => {
  const userId = req.user.id;
  const users = await UsersModels.findByPk(userId);
  if (users?.role !== "admin") {
    return error(
      res,
      403,
      "Access denied. Admins only.",
      "You are not an admin.",
    );
  }
  next();
};

export const verifyChef = async (req, res, next) => {
  const userId = req.user.id;
  const users = await UsersModels.findByPk(userId);
  if (users?.role !== "chief") {
    return error(
      res,
      403,
      "Access denied. Chiefs only.",
      "You are not a chief.",
    );
  }
  next();
};
