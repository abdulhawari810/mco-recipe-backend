import jwt from "jsonwebtoken";

export const generateAccessToken = async (payload) => {
  return jwt.sign(payload, process.env.ACCESS_SECRET, { expiresIn: "1d" });
};

export const generateRefreshToken = async (payload) => {
  return jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: "7d" });
};
