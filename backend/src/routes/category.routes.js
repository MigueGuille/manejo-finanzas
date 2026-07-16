import { Router } from "express";
import { categoryController } from "../controllers/category.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { categorySchema } from "../validators/schemas.js";

export const categoryRoutes = Router();

categoryRoutes.get("/", asyncHandler(categoryController.list));
categoryRoutes.post("/", validate(categorySchema), asyncHandler(categoryController.create));
categoryRoutes.put("/:id", validate(categorySchema.partial()), asyncHandler(categoryController.update));
categoryRoutes.delete("/:id", asyncHandler(categoryController.remove));
