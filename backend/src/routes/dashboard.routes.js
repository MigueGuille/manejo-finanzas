import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { periodQuerySchema } from "../validators/schemas.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/summary", validate(periodQuerySchema, "query"), asyncHandler(dashboardController.summary));
dashboardRoutes.get("/history", validate(periodQuerySchema, "query"), asyncHandler(dashboardController.history));
