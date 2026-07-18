import { transactionRepository } from "../repositories/transaction.repository.js";
import { ensureCategory } from "./category.service.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/apiResponse.js";

const ensureBudget = async (userId, data, existingTransaction = null) => {
  if (!data.budgetId) return;

  const nextType = data.type || existingTransaction?.type;
  const nextCategoryId = data.categoryId || existingTransaction?.categoryId;
  if (nextType !== "expense") throw new AppError("Only expense transactions can be assigned to budgets", 422);

  const budget = await prisma.budget.findFirst({ where: { id: data.budgetId, userId } });
  if (!budget) throw new AppError("Budget not found", 404);
  if (budget.categoryId && budget.categoryId !== nextCategoryId) {
    throw new AppError("Budget category does not match transaction category", 422);
  }
};

export const transactionService = {
  list(userId, query) {
    return transactionRepository.findMany(userId, query);
  },
  async create(userId, data) {
    const category = await ensureCategory(userId, data.categoryId);
    if (category.type !== data.type) {
      throw new AppError("Category type does not match transaction type", 422);
    }
    await ensureBudget(userId, data);
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
    await ensureBudget(userId, data, transaction);
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
