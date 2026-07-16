import { transactionRepository } from "../repositories/transaction.repository.js";
import { ensureCategory } from "./category.service.js";
import { AppError } from "../utils/apiResponse.js";

export const transactionService = {
  list(userId, query) {
    return transactionRepository.findMany(userId, query);
  },
  async create(userId, data) {
    const category = await ensureCategory(userId, data.categoryId);
    if (category.type !== data.type) {
      throw new AppError("Category type does not match transaction type", 422);
    }
    return transactionRepository.create(userId, data);
  },
  async update(userId, id, data) {
    const transaction = await transactionRepository.findById(userId, id);
    if (!transaction) throw new AppError("Transaction not found", 404);
    if (data.categoryId) {
      const category = await ensureCategory(userId, data.categoryId);
      const nextType = data.type || transaction.type;
      if (category.type !== nextType) throw new AppError("Category type does not match transaction type", 422);
    }
    const needsCurrencyRecalculation =
      data.amount !== undefined || data.currency !== undefined || data.exchangeRate !== undefined || data.exchangeDifferenceBs !== undefined;
    const payload = needsCurrencyRecalculation
      ? {
          amount: data.amount ?? transaction.amount,
          currency: data.currency ?? transaction.currency,
          exchangeRate: data.exchangeRate ?? transaction.exchangeRate,
          exchangeDifferenceBs: data.exchangeDifferenceBs ?? transaction.exchangeDifferenceBs,
          ...data
        }
      : data;
    return transactionRepository.update(userId, id, payload);
  },
  async remove(userId, id) {
    const transaction = await transactionRepository.findById(userId, id);
    if (!transaction) throw new AppError("Transaction not found", 404);
    await transactionRepository.softDelete(userId, id);
    return { id };
  }
};
