import {
  RecipeModels,
  UsersModels,
  CategoriesModels,
} from "../models/initialize.model.js";
import { success, error } from "../utils/response.utils.js";
import slugify from "slugify";
import { Op } from "sequelize";

export const getAllRecipes = async (req, res) => {
  try {
    const { search, categoryId, difficulty, time } = req.query;
    let { page = 1, limit = 12 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;

    const whereClause = {
      status: "accept",
    };

    if (search) {
      whereClause.title = { [Op.like]: `%${search}%` };
    }

    if (categoryId) {
      whereClause.categoryId = parseInt(categoryId);
    }

    if (difficulty) {
      whereClause.difficulty = { [Op.like]: `%${difficulty}%` };
    }

    if (time) {
      whereClause.time = { [Op.like]: `%${time}%` };
    }

    const { count, rows } = await RecipeModels.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: UsersModels,
          as: "recipe",
          attributes: ["id", "username", "profile"],
        },
        {
          model: CategoriesModels,
          as: "category",
          attributes: ["name"],
        },
      ],
    });

    if (search && rows?.length !== 0) {
      return success(res, 200, `${rows?.length} Data Found`, {
        totalData: count,
        totalPage: Math.ceil(count / limit),
        currentPage: page,
        data: rows,
      });
    } else {
      return success(res, 200, `Pencarian ${search} tidak ditemukan`, {
        totalData: count,
        totalPage: Math.ceil(count / limit),
        currentPage: page,
        data: rows,
      });
    }

    success(res, 200, "Get all recipes successfully", {
      totalData: count,
      totalPage: Math.ceil(count / limit),
      currentPage: page,
      data: rows,
    });
  } catch (errors) {
    error(res, 500, errors.message);
  }
};
export const getAllRecipesForAdmin = async (req, res) => {
  try {
    const { search, status } = req.query;
    let { page = 1, limit = 12 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;

    const whereClause = {};

    if (search) {
      whereClause.title = { [Op.like]: `%${search}%` };
    }

    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await RecipeModels.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: UsersModels,
          as: "recipe",
          attributes: ["id", "username", "profile"],
        },
        {
          model: CategoriesModels,
          as: "category",
          attributes: ["name"],
        },
      ],
    });

    success(res, 200, "Get all recipes successfully", {
      totalData: count,
      totalPage: Math.ceil(count / limit),
      currentPage: page,
      data: rows,
    });
  } catch (errors) {
    error(res, 500, errors.message);
  }
};
export const getRecipesByAuthor = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, categoryId, time, difficulty, status } = req.query;
    let { page = 1, limit = 50 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const whereClause = { userId };

    if (search) {
      whereClause.title = { [Op.like]: `%${search}%` };
    }

    if (categoryId) {
      whereClause.categoryId = parseInt(categoryId);
    }

    if (difficulty) {
      whereClause.difficulty = { [Op.like]: `%${difficulty}%` };
    }

    if (time) {
      whereClause.time = { [Op.like]: `%${time}%` };
    }
    if (status) {
      whereClause.status = status;
    }

    console.log("whereClause", whereClause);
    const { count, rows } = await RecipeModels.findAndCountAll({
      where: whereClause,
      include: [
        { model: UsersModels, as: "recipes_authors", raw: true },
        {
          model: CategoriesModels,
          as: "category",
          raw: true,
          attributes: ["name"],
        },
      ],
      limit,
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });
    success(res, 200, "Get recipes by author successfully", {
      totalData: count,
      totalPage: Math.ceil(count / limit),
      currentPage: page,
      data: rows,
    });
  } catch (errors) {
    error(res, 500, errors.message);
  }
};
export const getRecipesById = async (req, res) => {
  try {
    const id = req.params.id;
    const recipe = await RecipeModels.findOne({
      where: {
        id,
      },
      include: [
        {
          model: CategoriesModels,
          as: "category",
          attributes: ["name"],
        },
      ],
    });

    if (!recipe) {
      return error(res, 404, "Recipe not found");
    }

    success(res, 200, "Get recipe by ID successfully", recipe);
  } catch (errors) {
    error(res, 500, errors.message);
  }
};
export const getRecipesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    let { page = 1, limit = 50 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const { count, rows } = await RecipeModels.findAndCountAll({
      where: {
        categoryId,
      },
      limit,
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });
    success(res, 200, "Get recipes by category successfully", {
      totalData: count,
      totalPage: Math.ceil(count / limit),
      currentPage: page,
      data: rows,
    });
  } catch (errors) {
    error(res, 500, errors.message);
  }
};
export const countRecipesByAuthorStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const pendingCount = await RecipeModels.count({
      where: {
        userId,
        status: "pending",
      },
    });
    const draftCount = await RecipeModels.count({
      where: {
        userId,
        status: "draft",
      },
    });
    const acceptCount = await RecipeModels.count({
      where: {
        userId,
        status: "accept",
      },
    });
    const rejectCount = await RecipeModels.count({
      where: {
        userId,
        status: "reject",
      },
    });
    success(res, 200, "Count recipes by author status successfully", {
      pending: pendingCount,
      draft: draftCount,
      accept: acceptCount,
      reject: rejectCount,
    });
  } catch (errors) {
    error(res, 500, errors.message);
  }
};
export const countAllRecipesStatus = async (req, res) => {
  try {
    const pendingCount = await RecipeModels.count({
      where: {
        status: "pending",
      },
    });
    const draftCount = await RecipeModels.count({
      where: {
        status: "draft",
      },
    });
    const acceptCount = await RecipeModels.count({
      where: {
        status: "accept",
      },
    });
    const rejectCount = await RecipeModels.count({
      where: {
        status: "reject",
      },
    });
    success(res, 200, "Count all recipes status successfully", {
      pending: pendingCount,
      draft: draftCount,
      accept: acceptCount,
      reject: rejectCount,
    });
  } catch (errors) {
    error(res, 500, errors.message);
  }
};
export const createRecipes = async (req, res) => {
  try {
    const userId = req.user.id;
    const existinguser = await UsersModels.findOne({
      where: {
        id: userId,
      },
    });
    const existingRecipe = await RecipeModels.findOne({
      where: {
        title: req.body.title,
        userId,
      },
    });

    let uncategorized = await CategoriesModels.findOne({
      where: { name: "Uncategorized" },
      attributes: ["id"],
      raw: true,
    });

    if (!uncategorized) {
      uncategorized = await CategoriesModels.create({
        name: "Uncategorized",
      });
    }

    if (!existinguser) {
      return error(res, 404, "User not found");
    }
    if (existingRecipe) {
      return error(res, 400, "A recipe with this title already exists");
    }
    const {
      title,
      description,
      image,
      difficulty,
      time,
      categoryId,
      ingredients,
      instructions,
    } = req.body;
    const slug = slugify(title, { lower: true });
    const newRecipe = await RecipeModels.create({
      title,
      slug,
      description,
      difficulty,
      time,
      author: existinguser?.username,
      image,
      userId,
      categoryId: Number(categoryId) || uncategorized.id,
      ingredients: JSON.stringify(ingredients),
      instructions: JSON.stringify(instructions),
    });
    success(res, 201, "Create recipe successfully");
  } catch (errors) {
    error(res, 500, errors.message);
  }
};
export const createMultipleRecipes = async (req, res) => {
  try {
    const userId = req.user.id;
    const existinguser = await UsersModels.findOne({
      where: {
        id: userId,
      },
    });

    if (!existinguser) {
      return error(res, 404, "User not found");
    }

    let uncategorized = await CategoriesModels.findOne({
      where: { name: "Uncategorized" },
      attributes: ["id"],
      raw: true,
    });

    if (!uncategorized) {
      uncategorized = await CategoriesModels.create({
        slug: "uncategorized",
        desc: "Tidak terdaftar kategori",
        name: "Uncategorized",
      });
    }

    const recipes = req.body;

    if (!Array.isArray(recipes) || recipes.length === 0) {
      return error(res, 400, "Recipes must be a non-empty array");
    }

    const createdRecipes = [];
    const errors_list = [];

    for (let i = 0; i < recipes.length; i++) {
      try {
        const existingRecipe = await RecipeModels.findOne({
          where: {
            title: recipes[i].title,
            userId,
          },
        });

        if (existingRecipe) {
          errors_list.push({
            index: i,
            title: recipes[i].title,
            message: "Recipe already exists",
          });
          continue;
        }

        const {
          title,
          description,
          image,
          categoryId,
          difficulty,
          time,
          ingredients,
          instructions,
          status,
        } = recipes[i];
        const slug = slugify(title, { lower: true });

        const newRecipe = await RecipeModels.create({
          title,
          slug,
          description,
          difficulty,
          time,
          author: existinguser.username,
          image,
          userId,
          status,
          categoryId: Number(categoryId) || Number(uncategorized.id),
          ingredients: JSON.stringify(ingredients),
          instructions: JSON.stringify(instructions),
        });

        createdRecipes.push(newRecipe);
      } catch (err) {
        errors_list.push({
          index: i,
          title: recipes[i].title,
          message: err.message,
        });
      }
    }

    success(res, 201, "Recipes created successfully", {
      created: createdRecipes.length,
      failed: errors_list.length,
      data: createdRecipes,
      errors: errors_list,
    });
  } catch (errors) {
    error(res, 500, errors.message);
  }
};
export const updateRecipesById = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.id;
    const existingRecipe = await RecipeModels.findOne({
      where: {
        id: recipeId,
        userId,
      },
    });
    const existinguser = await UsersModels.findOne({
      where: {
        id: userId,
      },
    });
    if (!existinguser) {
      return error(res, 404, "User not found");
    }
    if (!existingRecipe) {
      return error(res, 404, "Recipe not found");
    }
    const {
      title,
      description,
      image,
      categoryId,
      difficulty,
      time,
      ingredients,
      instructions,
    } = req.body;
    const slug = slugify(title, { lower: true });
    await existingRecipe.update({
      title,
      slug,
      description,
      difficulty,
      time,
      image,
      author: existinguser?.username,
      categoryId: Number(categoryId) || existingRecipe.categoryId,
      ingredients: JSON.stringify(ingredients),
      instructions: JSON.stringify(instructions),
    });
    success(res, 200, "Recipe updated successfully");
  } catch (errors) {
    error(res, 500, errors.message);
  }
};
export const updateStatusRecipesById = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const { status } = req.body;

    console.log("status", status);
    const existingRecipe = await RecipeModels.findOne({
      where: {
        id: recipeId,
      },
    });
    if (!existingRecipe) {
      return error(res, 404, "Recipe not found");
    }
    await existingRecipe.update(
      {
        status,
      },
      {
        where: {
          id: recipeId,
        },
      },
    );
    success(res, 200, "Recipe status updated successfully");
  } catch (errors) {
    error(res, 500, errors.message);
  }
};
export const deleteRecipesById = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.id;
    const existingRecipe = await RecipeModels.findOne({
      where: {
        id: recipeId,
        userId,
      },
    });
    if (!existingRecipe) {
      return error(res, 404, "Recipe not found");
    }
    await existingRecipe.destroy();
    success(res, 200, "Recipe deleted successfully");
  } catch (errors) {
    error(res, 500, errors.message);
  }
};
