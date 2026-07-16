import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
const money = z.coerce.number().positive().max(999999999999.99);
const optionalMoney = z.coerce.number().min(0).max(999999999999.99).optional().nullable();
const exchangeRate = z.coerce.number().min(0).max(999999999999.9999).optional().nullable();
const uuid = z.string().uuid();

export const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
  currency: z.string().min(3).max(5).optional()
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});

export const categorySchema = z.object({
  name: z.string().min(2),
  type: z.enum(["income", "expense"]),
  color: z.string().min(3).max(20).optional().nullable(),
  icon: z.string().max(40).optional().nullable(),
  isEssential: z.boolean().optional()
});

export const transactionSchema = z.object({
  categoryId: uuid,
  type: z.enum(["income", "expense"]),
  amount: money,
  currency: z.enum(["USD", "VES", "BS"]).default("USD"),
  exchangeRate,
  exchangeDifferenceBs: optionalMoney,
  paymentMethod: z.string().max(80).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  transactionDate: isoDate,
  isRecurring: z.boolean().optional()
});

export const transactionQuerySchema = z.object({
  from: isoDate.optional(),
  to: isoDate.optional(),
  category: uuid.optional(),
  type: z.enum(["income", "expense"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});

export const recurringSchema = z.object({
  categoryId: uuid,
  type: z.enum(["income", "expense"]),
  amount: money,
  currency: z.enum(["USD", "VES", "BS"]).default("USD"),
  exchangeRate,
  exchangeDifferenceBs: optionalMoney,
  paymentMethod: z.string().max(80).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "yearly"]),
  startDate: isoDate,
  endDate: isoDate.optional().nullable(),
  active: z.boolean().optional()
});

export const budgetSchema = z.object({
  categoryId: uuid,
  periodType: z.enum(["daily", "biweekly", "monthly"]),
  amountLimit: money,
  periodStart: isoDate,
  periodEnd: isoDate
});

export const savingsGoalSchema = z.object({
  name: z.string().min(2),
  targetAmount: money,
  targetDate: isoDate.optional().nullable()
});

export const contributionSchema = z.object({
  amount: money,
  contributionDate: isoDate
});

export const settingsSchema = z.object({
  currency: z.string().min(3).max(5),
  periodType: z.enum(["daily", "biweekly", "monthly"]),
  biweeklyConfig: z
    .object({
      firstCut: z.coerce.number().int().min(1).max(28).default(15),
      secondCut: z.union([z.literal("end_of_month"), z.coerce.number().int().min(16).max(31)]).default("end_of_month")
    })
    .optional()
    .nullable()
});

export const periodQuerySchema = z.object({
  period_type: z.enum(["daily", "biweekly", "monthly"]).optional(),
  period_start: isoDate.optional(),
  period_end: isoDate.optional(),
  limit: z.coerce.number().int().positive().max(60).default(12).optional()
});

export const exportQuerySchema = z.object({
  format: z.enum(["csv", "pdf"]).default("csv"),
  from: isoDate.optional(),
  to: isoDate.optional(),
  category: uuid.optional(),
  type: z.enum(["income", "expense"]).optional()
});
