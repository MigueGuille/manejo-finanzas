import { Prisma } from "@prisma/client";
import { addDays, addMonths, addYears, isAfter, isBefore } from "date-fns";
import { prisma } from "../config/prisma.js";
import { rangeWhere, toDateOnly, toISODate } from "../utils/datePeriods.js";
import { calculateBudgetUsage, normalizeMoney } from "./financeMath.service.js";
import { ensureCategory } from "./category.service.js";
import { AppError } from "../utils/apiResponse.js";

const addBudgetPeriod = (date, periodType) => {
  const current = toDateOnly(date);
  if (periodType === "daily") return addDays(current, 1);
  if (periodType === "biweekly") return addDays(current, 15);
  if (periodType === "yearly") return addYears(current, 1);
  return addMonths(current, 1);
};

const maxDate = (left, right) => (isAfter(left, right) ? left : right);
const minDate = (left, right) => (isBefore(left, right) ? left : right);
const getOccurrenceEnd = (nextOccurrenceStart, recurrenceEnd) =>
  isBefore(nextOccurrenceStart, recurrenceEnd) ? addDays(nextOccurrenceStart, -1) : recurrenceEnd;

export const getBudgetOccurrenceWindow = (budget, anchor = new Date()) => {
  const recurrenceStart = toDateOnly(budget.periodStart);
  const recurrenceEnd = toDateOnly(budget.periodEnd);
  const currentAnchor = minDate(maxDate(toDateOnly(anchor), recurrenceStart), recurrenceEnd);

  let occurrenceStart = recurrenceStart;
  let nextOccurrenceStart = addBudgetPeriod(occurrenceStart, budget.periodType);
  let occurrenceEnd = getOccurrenceEnd(nextOccurrenceStart, recurrenceEnd);

  while (isBefore(occurrenceEnd, currentAnchor) && isBefore(nextOccurrenceStart, recurrenceEnd)) {
    occurrenceStart = nextOccurrenceStart;
    nextOccurrenceStart = addBudgetPeriod(occurrenceStart, budget.periodType);
    occurrenceEnd = getOccurrenceEnd(nextOccurrenceStart, recurrenceEnd);
  }

  const today = toDateOnly(new Date());
  const status = isBefore(today, recurrenceStart) ? "upcoming" : isAfter(today, recurrenceEnd) ? "expired" : "active";

  return {
    occurrenceStart,
    occurrenceEnd,
    recurrenceStart,
    recurrenceEnd,
    status
  };
};

export const enrichBudget = async (budget, anchor = new Date()) => {
  const window = getBudgetOccurrenceWindow(budget, anchor);
  const spent = await prisma.transaction.aggregate({
    where: {
      userId: budget.userId,
      ...(budget.categoryId ? { categoryId: budget.categoryId } : { budgetId: budget.id }),
      type: "expense",
      deletedAt: null,
      transactionDate: rangeWhere(window.occurrenceStart, window.occurrenceEnd)
    },
    _sum: { amountUsd: true }
  });

  return {
    ...budget,
    amountLimit: normalizeMoney(budget.amountLimit),
    occurrenceStart: toISODate(window.occurrenceStart),
    occurrenceEnd: toISODate(window.occurrenceEnd),
    recurrenceStart: toISODate(window.recurrenceStart),
    recurrenceEnd: toISODate(window.recurrenceEnd),
    recurrenceStatus: window.status,
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
    if (data.categoryId) {
      const category = await ensureCategory(userId, data.categoryId);
      if (category.type !== "expense") throw new AppError("Budgets can only be assigned to expense categories", 422);
    }
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
    if (data.categoryId) {
      const category = await ensureCategory(userId, data.categoryId);
      if (category.type !== "expense") throw new AppError("Budgets can only be assigned to expense categories", 422);
    }
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
