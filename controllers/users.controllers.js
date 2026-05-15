import { Op } from "sequelize";
import { RecipeModels, UsersModels } from "../models/initialize.model.js";
import { success, error } from "../utils/response.utils.js";
import {
  usernameRegex,
  emailRegex,
  passwordRegex,
} from "../utils/regexp.utils.js";
import argon2 from "argon2";

export const getUsers = async (req, res) => {
  try {
    const { search, sort, filter } = req.query;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    if (filter) {
      const filters = JSON.parse(filter);
      if (filters.role) {
        whereClause.role = filters.role;
      } else if (filters.is_active) {
        whereClause.is_active = filters.is_active;
      } else if (filters.is_verified) {
        whereClause.is_verified = filters.is_verified;
      }
    }

    const orderClause = [];
    if (sort) {
      if (sort === "asc") {
        orderClause.push(["username", "ASC"]);
      } else if (sort === "desc") {
        orderClause.push(["username", "DESC"]);
      }
    }
    const users = await UsersModels.findAll({
      where: whereClause,
      order: orderClause,
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: RecipeModels,
          as: "recipes",
          attributes: ["id"],
        },
      ],
    });

    if (search && users.length === 0) {
      return success(
        res,
        200,
        `Tidak ada pengguna yang ditemukan dengan kata kunci "${search}" atau filter yang diterapkan`,
      );
    }

    if (users?.length === 0) {
      return success(res, 200, "Data users masih kosong");
    }

    success(res, 200, "Data users berhasil ditemukan", users);
  } catch (errors) {
    error(res, 500, errors.message);
  }
};
export const getUsersById = async (req, res) => {
  try {
    const { id } = req.params;
    const users = await UsersModels.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ["password"],
      },
    });

    if (!users) {
      return error(res, 404, "Users tidak ditemukan!");
    }

    success(res, 200, "Users berhasil ditemukan", users);
  } catch (errors) {
    error(res, 500, errors.message);
  }
};
export const createUsers = async (req, res) => {
  try {
    const {
      username,
      email,
      confPassword,
      password,
      is_active,
      is_verified,
      gender,
      profile,
    } = req.body;

    const existing = await UsersModels.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    const checkRole = await UsersModels.findAndCountAll();

    const roles = checkRole.count === 0 ? "admin" : "user";

    if (existing) {
      return error(
        res,
        400,
        "Username atau Alamat Email sudah pernah digunakan",
      );
    }

    if (!usernameRegex.test(username)) {
      return error(
        res,
        400,
        "Username minimal 5 karakter dengan huruf besar dan kecil",
      );
    }

    if (!emailRegex.test(email)) {
      return error(res, 400, "Email tidak valid");
    }

    if (!passwordRegex.test(password)) {
      return error(
        res,
        400,
        "Password minimal 8 karakter dengan huruf besar, kecil, angka, dan karakter khusus",
      );
    }

    if (password !== confPassword) {
      return error(res, 400, "Password dan konfirmasi password tidak cocok");
    }

    const hashedPassword = await argon2.hash(password);

    const newUsers = await UsersModels.create({
      username,
      email,
      password: hashedPassword,
      role: roles,
      is_active: is_active || true,
      is_verified: is_verified || false,
      gender,
      profile,
    });

    success(res, 201, "Users berhasil dibuat", {
      id: newUsers.id,
      username: newUsers.username,
      email: newUsers.email,
      role: newUsers.role,
      is_active: newUsers.is_active,
      is_verified: newUsers.is_verified,
      gender: newUsers.gender,
      profile: newUsers.profile,
    });
  } catch (errors) {
    error(res, 500, errors.message);
  }
};
export const updateUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, gender, profile, is_active, is_verified, role } =
      req.body;

    const users = await UsersModels.findOne({
      where: { id },
    });

    if (!users) {
      return error(res, 404, "Users tidak ditemukan!");
    }

    const existing = await UsersModels.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
        id: { [Op.ne]: id },
      },
    });

    if (existing) {
      return error(
        res,
        400,
        "Username atau Alamat Email sudah pernah digunakan",
      );
    }

    if (username && !usernameRegex.test(username)) {
      return error(
        res,
        400,
        "Username minimal 5 karakter dengan huruf besar dan kecil",
      );
    }

    if (email && !emailRegex.test(email)) {
      return error(res, 400, "Email tidak valid");
    }

    await UsersModels.update(
      {
        username: username || users.username,
        email: email || users.email,
        gender,
        profile,
        is_active: is_active !== undefined ? is_active : users.is_active,
        is_verified:
          is_verified !== undefined ? is_verified : users.is_verified,
        role: role !== undefined ? role : users.role,
      },
      { where: { id } },
    );

    const updatedUsers = await UsersModels.findOne({
      where: { id },
      attributes: { exclude: ["password"] },
    });

    success(res, 200, "Users berhasil diperbarui", updatedUsers);
  } catch (errors) {
    error(res, 500, errors.message);
  }
};
export const updateStatusUsers = async (req, res) => {
  try {
    const userId = req.params.id;
    const { is_active } = req.body;

    const users = await UsersModels.findOne({
      where: { id: userId },
    });

    if (!users) {
      return error(res, 200, "Users tidak ditemukan!");
    }

    if (users.role === "admin") {
      return error(res, 400, "Tidak dapat mengubah status admin");
    }
    await UsersModels.update(
      {
        is_active: is_active !== undefined ? is_active : users.is_active,
      },
      { where: { id: userId } },
    );
    success(res, 200, "Status users berhasil diperbarui");
  } catch (errors) {
    error(res, 500, errors.message);
  }
};
export const createAllUsers = async (req, res) => {
  try {
    const users = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return error(res, 400, "Data users harus berupa array dan tidak kosong");
    }

    const createdUsers = [];

    for (const user of users) {
      const {
        username,
        email,
        password,
        confPassword,
        gender,
        profile,
        is_active,
        is_verified,
      } = user;

      const existing = await UsersModels.findOne({
        where: {
          [Op.or]: [{ username }, { email }],
        },
      });

      if (existing) {
        return error(
          res,
          400,
          `Username atau Email ${username} sudah pernah digunakan`,
        );
      }

      if (!usernameRegex.test(username)) {
        return error(res, 400, `Username ${username} tidak valid`);
      }

      if (!emailRegex.test(email)) {
        return error(res, 400, `Email ${email} tidak valid`);
      }

      if (!passwordRegex.test(password)) {
        return error(
          res,
          400,
          `Password tidak memenuhi kriteria untuk user ${username}`,
        );
      }

      if (password !== confPassword) {
        return error(res, 400, `Password tidak cocok untuk user ${username}`);
      }

      const hashedPassword = await argon2.hash(password);

      const checkRole = await UsersModels.findAndCountAll();
      const roles = checkRole.count === 0 ? "admin" : "users";

      const newUser = await UsersModels.create({
        username,
        email,
        password: hashedPassword,
        role: roles,
        is_active: is_active !== undefined ? is_active : "active",
        is_verified: is_verified !== undefined ? is_verified : "in_verified",
        gender,
        profile,
      });

      createdUsers.push({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      });
    }

    success(res, 201, "Semua users berhasil dibuat", createdUsers);
  } catch (errors) {
    error(res, 500, errors.message);
  }
};
export const deleteUsers = async (req, res) => {
  try {
    const { id } = req.params;

    const users = await UsersModels.findOne({
      where: { id },
    });

    if (!users) {
      return error(res, 404, "Users tidak ditemukan!");
    }

    await UsersModels.destroy({
      where: { id },
    });

    success(res, 200, "Users berhasil dihapus");
  } catch (errors) {
    error(res, 500, errors.message);
  }
};
