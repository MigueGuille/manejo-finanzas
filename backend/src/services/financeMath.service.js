export const normalizeMoney = (value) => Number(value || 0);
export const normalizeCurrency = (currency = "USD") => (currency === "BS" ? "VES" : currency);

export const calculateCurrencyAmounts = ({ amount, currency = "USD", exchangeRate = null, exchangeDifferenceBs = 0 }) => {
  const originalAmount = normalizeMoney(amount);
  const rate = normalizeMoney(exchangeRate);
  const normalizedCurrency = normalizeCurrency(currency);
  const amountUsd = normalizedCurrency === "USD" ? originalAmount : rate > 0 ? originalAmount / rate : 0;
  const amountBs = normalizedCurrency === "USD" ? (rate > 0 ? originalAmount * rate : 0) : originalAmount;

  return {
    currency: normalizedCurrency,
    exchangeRate: rate > 0 ? roundRate(rate) : null,
    amountUsd: roundMoney(amountUsd),
    amountBs: roundMoney(amountBs),
    exchangeDifferenceBs: roundMoney(exchangeDifferenceBs)
  };
};

export const calculateBalance = (transactions = []) => {
  const totals = transactions.reduce(
    (acc, transaction) => {
      const amountUsd = normalizeMoney(transaction.amountUsd ?? transaction.amount);
      const amountBs = normalizeMoney(transaction.amountBs);
      const exchangeDifferenceBs = normalizeMoney(transaction.exchangeDifferenceBs);
      if (transaction.type === "income") {
        acc.totalIncome += amountUsd;
        acc.totalIncomeBs += amountBs;
        acc.exchangeDifferenceBs += exchangeDifferenceBs;
      }
      if (transaction.type === "expense") {
        acc.totalExpense += amountUsd;
        acc.totalExpenseBs += amountBs;
        acc.exchangeDifferenceBs -= exchangeDifferenceBs;
      }
      return acc;
    },
    { totalIncome: 0, totalExpense: 0, totalIncomeBs: 0, totalExpenseBs: 0, exchangeDifferenceBs: 0 }
  );

  const balance = totals.totalIncome - totals.totalExpense;
  const balanceBs = totals.totalIncomeBs - totals.totalExpenseBs + totals.exchangeDifferenceBs;
  const savingsRate = totals.totalIncome > 0 ? (balance / totals.totalIncome) * 100 : 0;

  return {
    totalIncome: roundMoney(totals.totalIncome),
    totalExpense: roundMoney(totals.totalExpense),
    balance: roundMoney(balance),
    totalIncomeBs: roundMoney(totals.totalIncomeBs),
    totalExpenseBs: roundMoney(totals.totalExpenseBs),
    exchangeDifferenceBs: roundMoney(totals.exchangeDifferenceBs),
    balanceBs: roundMoney(balanceBs),
    savingsRate: roundMoney(savingsRate)
  };
};

export const calculateBudgetUsage = (amountLimit, spent) => {
  const limit = normalizeMoney(amountLimit);
  const used = normalizeMoney(spent);
  const percentage = limit > 0 ? (used / limit) * 100 : 0;

  return {
    spent: roundMoney(used),
    remaining: roundMoney(limit - used),
    percentage: roundMoney(percentage),
    status: percentage >= 100 ? "over" : percentage >= 80 ? "warning" : "ok"
  };
};

export const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
export const roundRate = (value) => Math.round((Number(value) + Number.EPSILON) * 10000) / 10000;
