import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { rangeWhere, toDateOnly } from "../utils/datePeriods.js";
import { calculateCurrencyAmounts } from "../services/financeMath.service.js";

const buildWhere = (userId, filters = {}) => ({
  userId,
  deletedAt: null,
  ...(filters.type ? { type: filters.type } : {}),
  ...(filters.category ? { categoryId: filters.category } : {}),
  ...(filters.from || filters.to ? { transactionDate: rangeWhere(filters.from, filters.to) } : {}),
  ...(filters.search
    ? {
        OR: [
          { description: { contains: filters.search, mode: "insensitive" } },
          { paymentMethod: { contains: filters.search, mode: "insensitive" } }
        ]
      }
    : {})
});

export const transactionRepository = {
  async findMany(userId, filters = {}) {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const where = buildWhere(userId, filters);
    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true, budget: true },
        orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.transaction.count({ where })
    ]);

    return { items, total, page, pageSize };
  },
  findAllForRange(userId, from, to) {
    return prisma.transaction.findMany({
      where: buildWhere(userId, { from, to }),
      include: { category: true, budget: true },
      orderBy: { transactionDate: "asc" }
    });
  },
  findById(userId, id) {
    return prisma.transaction.findFirst({ where: { id, userId, deletedAt: null }, include: { category: true, budget: true } });
  },
  create(userId, data) {
    const currencyAmounts = calculateCurrencyAmounts(data);
    return prisma.transaction.create({
      data: {
        ...data,
        ...currencyAmounts,
        userId,
        amount: new Prisma.Decimal(data.amount),
        exchangeRate: currencyAmounts.exchangeRate ? new Prisma.Decimal(currencyAmounts.exchangeRate) : null,
        amountUsd: new Prisma.Decimal(currencyAmounts.amountUsd),
        amountBs: new Prisma.Decimal(currencyAmounts.amountBs),
        exchangeDifferenceBs: new Prisma.Decimal(currencyAmounts.exchangeDifferenceBs),
        transactionDate: toDateOnly(data.transactionDate)
      },
      include: { category: true, budget: true }
    });
  },
  update(userId, id, data) {
    const currencyAmounts =
      data.amount !== undefined || data.currency !== undefined || data.exchangeRate !== undefined || data.exchangeDifferenceBs !== undefined
        ? calculateCurrencyAmounts(data)
        : null;
    const payload = {
      ...data,
      ...(currencyAmounts ? currencyAmounts : {}),
      ...(data.amount !== undefined ? { amount: new Prisma.Decimal(data.amount) } : {}),
      ...(currencyAmounts
        ? {
            exchangeRate: currencyAmounts.exchangeRate ? new Prisma.Decimal(currencyAmounts.exchangeRate) : null,
            amountUsd: new Prisma.Decimal(currencyAmounts.amountUsd),
            amountBs: new Prisma.Decimal(currencyAmounts.amountBs),
            exchangeDifferenceBs: new Prisma.Decimal(currencyAmounts.exchangeDifferenceBs)
          }
        : {}),
      ...(data.transactionDate ? { transactionDate: toDateOnly(data.transactionDate) } : {})
    };

    return prisma.transaction.update({ where: { id }, data: payload, include: { category: true, budget: true } });
  },
  softDelete(userId, id) {
    return prisma.transaction.update({ where: { id }, data: { deletedAt: new Date() } });
  }
};
