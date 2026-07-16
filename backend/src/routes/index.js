import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { ensurePeriodSnapshot } from "../middlewares/periodSnapshot.js";
import { authRoutes } from "./auth.routes.js";
import { budgetRoutes } from "./budget.routes.js";
import { categoryRoutes } from "./category.routes.js";
import { dashboardRoutes } from "./dashboard.routes.js";
import { recurringRoutes } from "./recurring.routes.js";
import { reportRoutes } from "./report.routes.js";
import { savingsRoutes } from "./savings.routes.js";
import { transactionRoutes } from "./transaction.routes.js";
import { userRoutes } from "./user.routes.js";

export const routes = Router();

routes.get("/health", (_req, res) => res.json({ success: true, message: "OK", data: { service: "finance-api" } }));
routes.use("/auth", authRoutes);
routes.use(requireAuth, ensurePeriodSnapshot);
routes.use("/categories", categoryRoutes);
routes.use("/transactions", transactionRoutes);
routes.use("/recurring-transactions", recurringRoutes);
routes.use("/budgets", budgetRoutes);
routes.use("/savings-goals", savingsRoutes);
routes.use("/dashboard", dashboardRoutes);
routes.use("/reports", reportRoutes);
routes.use("/user", userRoutes);

