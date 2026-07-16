import { prisma } from "../config/prisma.js";
import { getActivePeriod, previousPeriod, toDateOnly, toISODate } from "../utils/datePeriods.js";
import { calculateBalance, calculateBudgetUsage, normalizeMoney, roundMoney } from "./financeMath.service.js";
import { transactionRepository } from "../repositories/transaction.repository.js";

const summarizeByCategory = (transactions) => {
  const grouped = new Map();
  transactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      const key = transaction.categoryId;
      const current = grouped.get(key) || {
        categoryId: key,
        name: transaction.category?.name || "Sin categoria",
        color: transaction.category?.color || "#64748b",
        icon: transaction.category?.icon || "Circle",
        total: 0,
        totalBs: 0
      };
      current.total += normalizeMoney(transaction.amountUsd ?? transaction.amount);
      current.totalBs += normalizeMoney(transaction.amountBs);
      grouped.set(key, current);
    });

  return Array.from(grouped.values())
    .map((item) => ({ ...item, total: roundMoney(item.total), totalBs: roundMoney(item.totalBs) }))
    .sort((a, b) => b.total - a.total);
};

export const dashboardService = {
  async summary(userId, query = {}) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const periodType = query.period_type || user.periodType;
    const period =
      query.period_start && query.period_end
        ? { start: toDateOnly(query.period_start), end: toDateOnly(query.period_end) }
        : getActivePeriod(periodType, new Date(), user.biweeklyConfig);

    const previous = previousPeriod(periodType, period.start, user.biweeklyConfig);
    const [transactions, previousTransactions, budgets] = await Promise.all([
      transactionRepository.findAllForRange(userId, toISODate(period.start), toISODate(period.end)),
      transactionRepository.findAllForRange(userId, toISODate(previous.start), toISODate(previous.end)),
      prisma.budget.findMany({
        where: { userId, periodType, periodStart: period.start, periodEnd: toDateOnly(period.end) },
        include: { category: true }
      })
    ]);

    const totals = calculateBalance(transactions);
    const previousTotals = calculateBalance(previousTransactions);
    const balanceDelta =
      previousTotals.balance !== 0 ? roundMoney(((totals.balance - previousTotals.balance) / Math.abs(previousTotals.balance)) * 100) : null;
    const expensesByCategory = summarizeByCategory(transactions);

    const budgetStatus = budgets.map((budget) => {
      const spent = expensesByCategory.find((item) => item.categoryId === budget.categoryId)?.total || 0;
      return {
        id: budget.id,
        category: budget.category,
        amountLimit: normalizeMoney(budget.amountLimit),
        ...calculateBudgetUsage(budget.amountLimit, spent)
      };
    });

    return {
      period: { type: periodType, start: toISODate(period.start), end: toISODate(period.end) },
      totals,
      previousTotals,
      balanceDelta,
      expensesByCategory,
      topCategories: expensesByCategory.slice(0, 5),
      budgetStatus
    };
  },
  async history(userId, query = {}) {
    const periodType = query.period_type;
    const snapshots = await prisma.periodSnapshot.findMany({
      where: { userId, ...(periodType ? { periodType } : {}) },
      orderBy: { periodStart: "desc" },
      take: query.limit || 12
    });

    return snapshots.map((item) => ({
      ...item,
      totalIncome: normalizeMoney(item.totalIncome),
      totalExpense: normalizeMoney(item.totalExpense),
      balance: normalizeMoney(item.balance),
      savingsRate: normalizeMoney(item.savingsRate),
      periodStart: toISODate(item.periodStart),
      periodEnd: toISODate(item.periodEnd)
    }));
  }
};
