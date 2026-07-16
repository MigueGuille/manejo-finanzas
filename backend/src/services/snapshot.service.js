import { prisma } from "../config/prisma.js";
import { getActivePeriod, hasDatePassed, previousPeriod, toDateOnly, toISODate } from "../utils/datePeriods.js";
import { calculateBalance } from "./financeMath.service.js";
import { transactionRepository } from "../repositories/transaction.repository.js";

export const snapshotService = {
  async ensurePreviousPeriodSnapshot(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const active = getActivePeriod(user.periodType, new Date(), user.biweeklyConfig);
    const previous = previousPeriod(user.periodType, active.start, user.biweeklyConfig);
    if (!hasDatePassed(previous.end)) return null;

    const transactions = await transactionRepository.findAllForRange(userId, toISODate(previous.start), toISODate(previous.end));
    const totals = calculateBalance(transactions);
    const uniquePeriod = {
      userId,
      periodType: user.periodType,
      periodStart: toDateOnly(previous.start),
      periodEnd: toDateOnly(previous.end)
    };

    return prisma.periodSnapshot.upsert({
      where: {
        userId_periodType_periodStart_periodEnd: uniquePeriod
      },
      update: {},
      create: {
        ...uniquePeriod,
        userId,
        periodType: user.periodType,
        periodStart: previous.start,
        periodEnd: previous.end,
        totalIncome: totals.totalIncome,
        totalExpense: totals.totalExpense,
        balance: totals.balance,
        savingsRate: totals.savingsRate
      }
    });
  }
};
