import {
  UsersModels as User,
  RefreshTokenModels,
  UsersModels,
} from "../models/initialize.model.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { emailRegex, passwordRegex } from "../utils/regexp.utils.js";
import { Op } from "sequelize";
import { success, error } from "../utils/response.utils.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/token.services.js";
import dotenv from "dotenv";

dotenv.config();

const productionENV = process.env.APP_ENVIRONMENT === "production";

const register = async (req, res) => {
  try {
    const { email, password, confPassword, username } = req.body;

    // Validate input
    if (!email || !password || !confPassword || !username) {
      return res.status(400).json({
        message: "Email, password, confirm password, dan username diperlukan",
      });
    }

    // Validate password match
    if (password !== confPassword) {
      return res
        .status(400)
        .json({ message: "Password dan konfirmasi password tidak cocok" });
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Format email tidak valid" });
    }

    // Validate password format
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password harus minimal 8 karakter dengan huruf besar, angka, dan simbol",
      });
    }

    // Validate username format
    if (username.trim().length < 3) {
      return res
        .status(400)
        .json({ message: "Username harus minimal 3 karakter" });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password using argon2
    const hashedPassword = await argon2.hash(password);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      username,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (errors) {
    error(res, "Server error", errors.message);
  }
};

const login = async (req, res) => {
  try {
    const { UsersOrEmail, password } = req.body;

    // Validate input
    if (!UsersOrEmail) {
      return res.status(400).json({ message: "Email or username is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Find user by username or email
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: UsersOrEmail }, { username: UsersOrEmail }],
      },
    });

    if (user?.is_active === "banned") {
      return res.status(403).json({ message: "Your account has been banned" });
    }

    const existingRefreshToken = await RefreshTokenModels.findOne({
      where: {
        user_id: user?.id,
      },
    });

    if (existingRefreshToken) {
      await RefreshTokenModels.destroy({
        where: { user_id: user.id },
      });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = {
      id: user.id,
    };

    const accessToken = await generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(payload);

    await RefreshTokenModels.create({
      token: refreshToken,
      user_id: user.id,
    });

    await UsersModels.update(
      { is_active: "active" },
      { where: { id: user.id } },
    );

    res.cookie("AccessToken", accessToken, {
      httpOnly: true,
      secure: productionENV,
      sameSite: productionENV ? "none" : "lax",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    res.cookie("RefreshToken", refreshToken, {
      httpOnly: true,
      secure: productionENV,
      sameSite: productionENV ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successfully",
    });
  } catch (errors) {
    error(res, 500, "Server error", errors.message);
  }
};

const me = async (req, res) => {
  try {
    const users = req.user;
    const user = await UsersModels.findByPk(req.user.id, {
      attributes: {
        exclude: ["password"],
      },
    });

    if (!user) {
      return error(res, 404, "User not found");
    }

    success(res, 200, "User profile retrieved successfully", user);
  } catch (errors) {
    error(res, 500, "Server error", errors.message);
  }
};

const logout = async (req, res) => {
  try {
    const user = req.user.id;

    const existingUsers = await UsersModels.findByPk(user);
    if (!existingUsers) {
      return res.status(404).json({ message: "User not found" });
    }

    const token =
      req.cookies.AccessToken ||
      req?.headers?.authorization?.split(" ")[1] ||
      req.cookies.RefreshToken;
    if (!token) {
      return res.status(401).json({ message: "Access token not found" });
    }
    if (existingUsers.is_active === "banned") {
      await UsersModels.update(
        { is_active: "banned" },
        { where: { id: user } },
      );
    } else {
      await UsersModels.update(
        { is_active: "in_active" },
        { where: { id: user } },
      );
    }

    res.clearCookie("AccessToken", {
      httpOnly: true,
      secure: productionENV,
      sameSite: productionENV ? "none" : "lax",
    });
    res.clearCookie("RefreshToken", {
      httpOnly: true,
      secure: productionENV,
      sameSite: productionENV ? "none" : "lax",
    });
    success(res, 200, "Logout successfully");
  } catch (errors) {
    error(res, 500, "Server error", errors.message);
  }
};

const refresh = async (req, res) => {
  try {
    //const token = req.cookies.RefreshToken;
    const token =
      req.cookies.refreshToken ||
      req?.headers?.authorization?.split(" ")[1] ||
      null;
    if (!token) {
      return res.status(401).json({ message: "Refresh token not found" });
    }
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
    const isValid = await RefreshToken.findOne({
      where: {
        token,
      },
    });

    const newAccessToken = await generateAccessToken({ id: decoded.id });

    res.cookie("AccessToken", newAccessToken, {
      httpOnly: true,
      secure: productionENV,
      sameSite: productionENV ? "none" : "lax",
    });

    success(res, 200, "Access token refreshed successfully");
  } catch (errors) {
    error(res, 500, "Server error", errors.message);
  }
};

export { register, login, logout, me, refresh };
