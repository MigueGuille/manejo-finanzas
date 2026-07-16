import { Router } from "express";
import { recurringController } from "../controllers/recurring.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { recurringSchema } from "../validators/schemas.js";

export const recurringRoutes = Router();

recurringRoutes.get("/", asyncHandler(recurringController.list));
recurringRoutes.post("/", validate(recurringSchema), asyncHandler(recurringController.create));
recurringRoutes.put("/:id", validate(recurringSchema.partial()), asyncHandler(recurringController.update));
recurringRoutes.delete("/:id", asyncHandler(recurringController.remove));
