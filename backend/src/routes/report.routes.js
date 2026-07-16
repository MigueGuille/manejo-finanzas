import { Router } from "express";
import { reportController } from "../controllers/report.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { exportQuerySchema } from "../validators/schemas.js";

export const reportRoutes = Router();

reportRoutes.get("/export", validate(exportQuerySchema, "query"), asyncHandler(reportController.export));
