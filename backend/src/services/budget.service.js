import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { rangeWhere, toDateOnly } from "../utils/datePeriods.js";
import { calculateBudgetUsage, normalizeMoney } from "./financeMath.service.js";
import { ensureCategory } from "./category.service.js";
import { AppError } from "../utils/apiResponse.js";

const enrichBudget = async (budget) => {
  const spent = await prisma.transaction.aggregate({
    where: {
      userId: budget.userId,
      categoryId: budget.categoryId,
      type: "expense",
      deletedAt: null,
      transactionDate: rangeWhere(budget.periodStart, budget.periodEnd)
    },
    _sum: { amountUsd: true }
  });

  return {
    ...budget,
    amountLimit: normalizeMoney(budget.amountLimit),
    usage: calculateBudgetUsage(budget.amountLimit, spent._sum.amountUsd || 0)
  };
};

export const budgetService = {
  async list(userId, periodType) {
    const budgets = await prisma.budget.findMany({
      where: { userId, ...(periodType ? { periodType } : {}) },
      include: { category: true },
      orderBy: { periodStart: "desc" }
    });
    return Promise.all(budgets.map(enrichBudget));
  },
  async create(userId, data) {
    const category = await ensureCategory(userId, data.categoryId);
    if (category.type !== "expense") throw new AppError("Budgets can only be assigned to expense categories", 422);
    return prisma.budget.create({
      data: {
        ...data,
        userId,
        amountLimit: new Prisma.Decimal(data.amountLimit),
        periodStart: toDateOnly(data.periodStart),
        periodEnd: toDateOnly(data.periodEnd)
      },
      include: { category: true }
    });
  },
  async update(userId, id, data) {
    const budget = await prisma.budget.findFirst({ where: { id, userId } });
    if (!budget) throw new AppError("Budget not found", 404);
    if (data.categoryId) await ensureCategory(userId, data.categoryId);
    return prisma.budget.update({
      where: { id },
      data: {
        ...data,
        ...(data.amountLimit !== undefined ? { amountLimit: new Prisma.Decimal(data.amountLimit) } : {}),
        ...(data.periodStart ? { periodStart: toDateOnly(data.periodStart) } : {}),
        ...(data.periodEnd ? { periodEnd: toDateOnly(data.periodEnd) } : {})
      },
      include: { category: true }
    });
  },
  async remove(userId, id) {
    const budget = await prisma.budget.findFirst({ where: { id, userId } });
    if (!budget) throw new AppError("Budget not found", 404);
    await prisma.budget.delete({ where: { id } });
    return { id };
  }
};
