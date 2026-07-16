import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { settingsSchema } from "../validators/schemas.js";

export const userRoutes = Router();

userRoutes.get("/settings", asyncHandler(userController.settings));
userRoutes.put("/settings", validate(settingsSchema), asyncHandler(userController.updateSettings));
