import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { addFrequency, dateIsAfter, toDateOnly } from "../utils/datePeriods.js";
import { ensureCategory } from "./category.service.js";
import { AppError } from "../utils/apiResponse.js";
import { calculateCurrencyAmounts } from "./financeMath.service.js";

export const recurringService = {
  list(userId) {
    return prisma.recurringTransaction.findMany({ where: { userId }, include: { category: true }, orderBy: { createdAt: "desc" } });
  },
  async create(userId, data) {
    const category = await ensureCategory(userId, data.categoryId);
    if (category.type !== data.type) throw new AppError("Category type does not match recurrence type", 422);
    const currencyAmounts = calculateCurrencyAmounts(data);
    return prisma.recurringTransaction.create({
      data: {
        ...data,
        currency: currencyAmounts.currency,
        userId,
        amount: new Prisma.Decimal(data.amount),
        exchangeRate: currencyAmounts.exchangeRate ? new Prisma.Decimal(currencyAmounts.exchangeRate) : null,
        exchangeDifferenceBs: new Prisma.Decimal(currencyAmounts.exchangeDifferenceBs),
        startDate: toDateOnly(data.startDate),
        endDate: data.endDate ? toDateOnly(data.endDate) : null,
        nextRunDate: toDateOnly(data.startDate)
      },
      include: { category: true }
    });
  },
  async update(userId, id, data) {
    const existing = await prisma.recurringTransaction.findFirst({ where: { id, userId } });
    if (!existing) throw new AppError("Recurring transaction not found", 404);
    return prisma.recurringTransaction.update({
      where: { id },
      data: {
        ...data,
        ...(data.amount !== undefined ? { amount: new Prisma.Decimal(data.amount) } : {}),
        ...(data.exchangeRate !== undefined ? { exchangeRate: data.exchangeRate ? new Prisma.Decimal(data.exchangeRate) : null } : {}),
        ...(data.exchangeDifferenceBs !== undefined ? { exchangeDifferenceBs: new Prisma.Decimal(data.exchangeDifferenceBs || 0) } : {}),
        ...(data.startDate ? { startDate: toDateOnly(data.startDate) } : {}),
        ...(data.endDate ? { endDate: toDateOnly(data.endDate) } : {})
      },
      include: { category: true }
    });
  },
  async remove(userId, id) {
    const existing = await prisma.recurringTransaction.findFirst({ where: { id, userId } });
    if (!existing) throw new AppError("Recurring transaction not found", 404);
    await prisma.recurringTransaction.update({ where: { id }, data: { active: false } });
    return { id };
  },
  async runDue(now = new Date()) {
    const due = await prisma.recurringTransaction.findMany({
      where: { active: true, nextRunDate: { lte: toDateOnly(now) } }
    });

    for (const item of due) {
      await prisma.$transaction(async (tx) => {
        const currencyAmounts = calculateCurrencyAmounts(item);
        await tx.transaction.create({
          data: {
            userId: item.userId,
            categoryId: item.categoryId,
            type: item.type,
            amount: item.amount,
            currency: currencyAmounts.currency,
            exchangeRate: currencyAmounts.exchangeRate,
            amountUsd: currencyAmounts.amountUsd,
            amountBs: currencyAmounts.amountBs,
            exchangeDifferenceBs: currencyAmounts.exchangeDifferenceBs,
            paymentMethod: item.paymentMethod,
            description: item.description,
            transactionDate: item.nextRunDate,
            isRecurring: true,
            recurrenceId: item.id
          }
        });

        const nextRunDate = addFrequency(item.nextRunDate, item.frequency);
        await tx.recurringTransaction.update({
          where: { id: item.id },
          data: {
            nextRunDate,
            active: item.endDate && dateIsAfter(nextRunDate, item.endDate) ? false : item.active
          }
        });
      });
    }

    return { generated: due.length };
  }
};
