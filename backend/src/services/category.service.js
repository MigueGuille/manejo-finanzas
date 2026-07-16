import { categoryRepository } from "../repositories/category.repository.js";
import { AppError } from "../utils/apiResponse.js";

export const categoryService = {
  list(userId) {
    return categoryRepository.findAll(userId);
  },
  create(userId, data) {
    return categoryRepository.create(userId, data);
  },
  async update(userId, id, data) {
    await ensureCategory(userId, id);
    return categoryRepository.update(userId, id, data);
  },
  async remove(userId, id) {
    await ensureCategory(userId, id);
    return categoryRepository.remove(userId, id);
  }
};

export const ensureCategory = async (userId, categoryId) => {
  const category = await categoryRepository.findById(userId, categoryId);
  if (!category) throw new AppError("Category not found", 404);
  return category;
};

