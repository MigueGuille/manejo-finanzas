import { dashboardService } from "../services/dashboard.service.js";
import { ok } from "../utils/apiResponse.js";

export const dashboardController = {
  summary: async (req, res) => ok(res, await dashboardService.summary(req.user.id, req.query)),
  history: async (req, res) => ok(res, await dashboardService.history(req.user.id, req.query))
};

