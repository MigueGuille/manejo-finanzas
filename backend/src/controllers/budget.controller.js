import { budgetService } from "../services/budget.service.js";
import { created, ok } from "../utils/apiResponse.js";

export const budgetController = {
  list: async (req, res) => ok(res, await budgetService.list(req.user.id, req.query.period)),
  create: async (req, res) => created(res, await budgetService.create(req.user.id, req.body), "Budget created"),
  update: async (req, res) => ok(res, await budgetService.update(req.user.id, req.params.id, req.body), "Budget updated"),
  remove: async (req, res) => ok(res, await budgetService.remove(req.user.id, req.params.id), "Budget deleted")
};

