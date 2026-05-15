import { ProfileModels, UsersModels } from "../models/initialize.model.js";
import { success, error } from "../utils/response.utils.js";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const existingProfile = await ProfileModels.findOne({
      where: {
        userId,
      },
    });
    if (!existingProfile) {
      return error(res, 404, "Data Informasi tidak ditemukan");
    }

    success(res, 200, "Data informasi berhasil ditemukan!", existingProfile);
  } catch (errors) {
    error(res, 500, errors.message);
  }
};

export const createProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone, bio, gender, date, skill, preference, alergi } = req.body;

    const existingUsers = await UsersModel.findOne({
      where: {
        userId,
      },
    });

    if (!existingUsers) {
      return error(res, 404, "Users tidak ditemukan!");
    }
    await ProfileModels.create({
      phone: parseInt(phone),
      bio,
      gender,
      date,
      skill,
      preference,
      alergi,
    });

    success(res, 201, "Data informasi berhasil ditambahkan!");
  } catch (errors) {
    error(res, 500, errors.message);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone, bio, gender, date, skill, preference, alergi } = req.body;

    const existingUsers = await UsersModel.findOne({
      where: {
        userId,
      },
    });

    if (!existingUsers) {
      return error(res, 404, "Users tidak ditemukan!");
    }

    await ProfileModels.update(
      {
        phone: parseInt(phone),
        bio,
        gender,
        date,
        skill,
        preference,
        alergi,
      },
      {
        where: {
          userId,
        },
      },
    );

    success(res, 200, "Data informasi berhasil diupdate!");
  } catch (errors) {
    error(res, 500, errors.message);
  }
};
