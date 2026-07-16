import { Router } from "express";
import { transactionController } from "../controllers/transaction.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { transactionQuerySchema, transactionSchema } from "../validators/schemas.js";

export const transactionRoutes = Router();

transactionRoutes.get("/", validate(transactionQuerySchema, "query"), asyncHandler(transactionController.list));
transactionRoutes.post("/", validate(transactionSchema), asyncHandler(transactionController.create));
transactionRoutes.put("/:id", validate(transactionSchema.partial()), asyncHandler(transactionController.update));
transactionRoutes.delete("/:id", asyncHandler(transactionController.remove));
