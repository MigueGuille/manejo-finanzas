import { describe, expect, it } from "vitest";
import { calculateBalance, calculateBudgetUsage, calculateCurrencyAmounts } from "../src/services/financeMath.service.js";
import { getActivePeriod, toISODate } from "../src/utils/datePeriods.js";

describe("finance calculations", () => {
  it("calculates balance and savings rate by transaction type", () => {
    const result = calculateBalance([
      { type: "income", amount: 1000 },
      { type: "income", amount: 500 },
      { type: "expense", amount: 400 }
    ]);

    expect(result).toEqual({
      totalIncome: 1500,
      totalExpense: 400,
      balance: 1100,
      totalIncomeBs: 0,
      totalExpenseBs: 0,
      exchangeDifferenceBs: 0,
      balanceBs: 0,
      savingsRate: 73.33
    });
  });

  it("calculates USD and VES equivalents from exchange rate", () => {
    expect(calculateCurrencyAmounts({ amount: 15000, currency: "VES", exchangeRate: 165 })).toMatchObject({
      amountUsd: 90.91,
      amountBs: 15000
    });
    expect(calculateCurrencyAmounts({ amount: 18, currency: "USD", exchangeRate: 165 })).toMatchObject({
      amountUsd: 18,
      amountBs: 2970
    });
  });

  it("classifies budget usage thresholds", () => {
    expect(calculateBudgetUsage(1000, 500).status).toBe("ok");
    expect(calculateBudgetUsage(1000, 850).status).toBe("warning");
    expect(calculateBudgetUsage(1000, 1200).status).toBe("over");
  });

  it("builds configurable biweekly periods", () => {
    const first = getActivePeriod("biweekly", new Date("2026-07-10T12:00:00Z"), { firstCut: 15 });
    const second = getActivePeriod("biweekly", new Date("2026-07-16T12:00:00Z"), { firstCut: 15 });

    expect(toISODate(first.start)).toBe("2026-07-01");
    expect(toISODate(first.end)).toBe("2026-07-15");
    expect(toISODate(second.start)).toBe("2026-07-16");
    expect(toISODate(second.end)).toBe("2026-07-31");
  });
});
