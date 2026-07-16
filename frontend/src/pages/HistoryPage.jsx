import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ErrorPanel, LoadingPanel } from "../components/LoadStates.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { endpoints } from "../services/api.js";
import { useAuth } from "../store/AuthProvider.jsx";
import { money, percent } from "../utils/formatters.js";

export const HistoryPage = () => {
  const { user } = useAuth();
  const [periodType, setPeriodType] = useState("monthly");
  const history = useQuery({ queryKey: ["history", periodType], queryFn: () => endpoints.dashboard.history({ period_type: periodType, limit: 24 }) });
  const rows = history.data?.data || [];
  const chartRows = [...rows].reverse();

  return (
    <>
      <PageHeader
        title="Historico"
        description="Snapshots congelados de cierre por dia, quincena o mes."
        action={
          <select className="field max-w-44" value={periodType} onChange={(event) => setPeriodType(event.target.value)}>
            <option value="monthly">Mensual</option>
            <option value="biweekly">Quincenal</option>
            <option value="daily">Diario</option>
          </select>
        }
      />
      <div className="space-y-5 p-4 sm:p-6">
        {history.isLoading ? <LoadingPanel /> : null}
        {history.isError ? <ErrorPanel error={history.error} /> : null}
        <section className="panel p-4">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartRows}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="periodStart" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => money(value, user?.currency)} />
                <Area type="monotone" dataKey="balance" stroke="#18212f" fill="#10b981" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3">Periodo</th>
                  <th className="px-4 py-3 text-right">Ingresos</th>
                  <th className="px-4 py-3 text-right">Gastos</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3 text-right">Ahorro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-slate-800">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">{row.periodStart} a {row.periodEnd}</td>
                    <td className="px-4 py-3 text-right">{money(row.totalIncome, user?.currency)}</td>
                    <td className="px-4 py-3 text-right">{money(row.totalExpense, user?.currency)}</td>
                    <td className="px-4 py-3 text-right font-bold">{money(row.balance, user?.currency)}</td>
                    <td className="px-4 py-3 text-right">{percent(row.savingsRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
};

