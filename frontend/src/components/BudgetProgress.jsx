import { money, percent } from "../utils/formatters.js";

export const BudgetProgress = ({ budget, currency = "MXN" }) => {
  const usage = budget.usage || budget;
  const color = usage.status === "over" ? "bg-coral" : usage.status === "warning" ? "bg-gold" : "bg-mint";

  return (
    <div className="rounded-lg border border-line p-4 dark:border-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink dark:text-white">{budget.category?.name}</p>
          <p className="text-sm text-slate-500">{money(usage.spent, currency)} de {money(budget.amountLimit, currency)}</p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-200">{percent(usage.percentage)}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-full ${color}`} style={{ width: `${Math.min(usage.percentage || 0, 100)}%` }} />
      </div>
    </div>
  );
};

