import { Router } from "express";
import { savingsController } from "../controllers/savings.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { contributionSchema, savingsGoalSchema } from "../validators/schemas.js";

export const savingsRoutes = Router();

savingsRoutes.get("/", asyncHandler(savingsController.list));
savingsRoutes.post("/", validate(savingsGoalSchema), asyncHandler(savingsController.create));
savingsRoutes.post("/:id/contributions", validate(contributionSchema), asyncHandler(savingsController.contribute));
