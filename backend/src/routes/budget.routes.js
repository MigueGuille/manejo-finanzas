import { Router } from "express";
import { budgetController } from "../controllers/budget.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { budgetSchema, budgetUpdateSchema } from "../validators/schemas.js";

export const budgetRoutes = Router();

budgetRoutes.get("/", asyncHandler(budgetController.list));
budgetRoutes.post("/", validate(budgetSchema), asyncHandler(budgetController.create));
budgetRoutes.put("/:id", validate(budgetUpdateSchema), asyncHandler(budgetController.update));
budgetRoutes.delete("/:id", asyncHandler(budgetController.remove));
