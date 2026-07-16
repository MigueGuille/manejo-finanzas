import { transactionService } from "../services/transaction.service.js";
import { created, ok } from "../utils/apiResponse.js";

export const transactionController = {
  list: async (req, res) => ok(res, await transactionService.list(req.user.id, req.query)),
  create: async (req, res) => created(res, await transactionService.create(req.user.id, req.body), "Transaction created"),
  update: async (req, res) => ok(res, await transactionService.update(req.user.id, req.params.id, req.body), "Transaction updated"),
  remove: async (req, res) => ok(res, await transactionService.remove(req.user.id, req.params.id), "Transaction deleted")
};

