import { categoryService } from "../services/category.service.js";
import { created, ok } from "../utils/apiResponse.js";

export const categoryController = {
  list: async (req, res) => ok(res, await categoryService.list(req.user.id)),
  create: async (req, res) => created(res, await categoryService.create(req.user.id, req.body), "Category created"),
  update: async (req, res) => ok(res, await categoryService.update(req.user.id, req.params.id, req.body), "Category updated"),
  remove: async (req, res) => ok(res, await categoryService.remove(req.user.id, req.params.id), "Category deleted")
};

