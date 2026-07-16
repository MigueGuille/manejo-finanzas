import { recurringService } from "../services/recurring.service.js";
import { created, ok } from "../utils/apiResponse.js";

export const recurringController = {
  list: async (req, res) => ok(res, await recurringService.list(req.user.id)),
  create: async (req, res) => created(res, await recurringService.create(req.user.id, req.body), "Recurring transaction created"),
  update: async (req, res) => ok(res, await recurringService.update(req.user.id, req.params.id, req.body), "Recurring transaction updated"),
  remove: async (req, res) => ok(res, await recurringService.remove(req.user.id, req.params.id), "Recurring transaction disabled")
};

