import { Prisma } from "@prisma/client";
import { differenceInCalendarDays } from "date-fns";
import { prisma } from "../config/prisma.js";
import { toDateOnly } from "../utils/datePeriods.js";
import { normalizeMoney, roundMoney } from "./financeMath.service.js";
import { AppError } from "../utils/apiResponse.js";

const enrichGoal = (goal) => {
  const target = normalizeMoney(goal.targetAmount);
  const current = normalizeMoney(goal.currentAmount);
  const daysLeft = goal.targetDate ? Math.max(differenceInCalendarDays(goal.targetDate, new Date()), 0) : null;
  return {
    ...goal,
    targetAmount: target,
    currentAmount: current,
    progress: target > 0 ? roundMoney((current / target) * 100) : 0,
    suggestedPerPeriod:
      goal.targetDate && daysLeft !== null && daysLeft > 0 ? roundMoney((target - current) / Math.max(Math.ceil(daysLeft / 30), 1)) : null
  };
};

export const savingsService = {
  async list(userId) {
    const goals = await prisma.savingsGoal.findMany({
      where: { userId },
      include: { contributions: { orderBy: { contributionDate: "desc" } } },
      orderBy: { createdAt: "desc" }
    });
    return goals.map(enrichGoal);
  },
  create(userId, data) {
    return prisma.savingsGoal.create({
      data: {
        ...data,
        userId,
        targetAmount: new Prisma.Decimal(data.targetAmount),
        targetDate: data.targetDate ? toDateOnly(data.targetDate) : null
      }
    });
  },
  async contribute(userId, goalId, data) {
    const goal = await prisma.savingsGoal.findFirst({ where: { id: goalId, userId } });
    if (!goal) throw new AppError("Savings goal not found", 404);

    return prisma.$transaction(async (tx) => {
      const contribution = await tx.savingsContribution.create({
        data: {
          savingsGoalId: goalId,
          amount: new Prisma.Decimal(data.amount),
          contributionDate: toDateOnly(data.contributionDate)
        }
      });
      const updatedGoal = await tx.savingsGoal.update({
        where: { id: goalId },
        data: { currentAmount: { increment: new Prisma.Decimal(data.amount) } },
        include: { contributions: true }
      });
      return { contribution, goal: enrichGoal(updatedGoal) };
    });
  }
};

