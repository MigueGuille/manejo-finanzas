import { savingsService } from "../services/savings.service.js";
import { created, ok } from "../utils/apiResponse.js";

export const savingsController = {
  list: async (req, res) => ok(res, await savingsService.list(req.user.id)),
  create: async (req, res) => created(res, await savingsService.create(req.user.id, req.body), "Savings goal created"),
  contribute: async (req, res) =>
    created(res, await savingsService.contribute(req.user.id, req.params.id, req.body), "Contribution registered")
};

