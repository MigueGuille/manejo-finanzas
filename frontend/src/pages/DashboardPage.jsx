import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight, Download } from "lucide-react";
import { BudgetProgress } from "../components/BudgetProgress.jsx";
import { ErrorPanel, LoadingPanel } from "../components/LoadStates.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { endpoints } from "../services/api.js";
import { toast } from "../store/toastStore.js";
import { money, percent } from "../utils/formatters.js";

export const DashboardPage = () => {
  const summary = useQuery({ queryKey: ["dashboard-summary"], queryFn: () => endpoints.dashboard.summary() });
  const history = useQuery({ queryKey: ["dashboard-history"], queryFn: () => endpoints.dashboard.history({ limit: 8 }) });

  const data = summary.data?.data;
  const historyData = [...(history.data?.data || [])].reverse();

  const handleExport = async () => {
    const blob = await endpoints.reports.export("csv");
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "reporte-finanzas.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Reporte descargado", "El CSV se genero correctamente.");
  };

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Resumen del periodo activo en USD, equivalentes en Bs y diferencial cambiario."
        action={
          <button className="btn-secondary" type="button" onClick={handleExport}>
            <Download size={17} /> CSV
          </button>
        }
      />
      <div className="space-y-5 p-4 sm:p-6">
        {summary.isLoading ? <LoadingPanel /> : null}
        {summary.isError ? <ErrorPanel error={summary.error} /> : null}
        {data ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Ingresos USD" value={money(data.totals.totalIncome, "USD")} tone="income" meta={money(data.totals.totalIncomeBs, "VES")} />
              <StatCard label="Gastos USD" value={money(data.totals.totalExpense, "USD")} tone="expense" meta={money(data.totals.totalExpenseBs, "VES")} />
              <StatCard label="Balance USD" value={money(data.totals.balance, "USD")} tone="balance" meta={data.balanceDelta === null ? "Sin comparativa" : percent(data.balanceDelta)} />
              <StatCard label="Balance Bs" value={money(data.totals.balanceBs, "VES")} tone="neutral" meta={`Dif. ${money(data.totals.exchangeDifferenceBs, "VES")}`} />
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="panel p-4">
                <h2 className="mb-4 text-base font-bold text-ink dark:text-white">Evolucion de balance</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="periodStart" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value) => money(value, "USD")} />
                      <Area type="monotone" dataKey="balance" stroke="#18212f" fill="#10b981" fillOpacity={0.25} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="panel p-4">
                <h2 className="mb-4 text-base font-bold text-ink dark:text-white">Gastos por categoria</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.expensesByCategory} dataKey="total" nameKey="name" innerRadius={62} outerRadius={92}>
                        {data.expensesByCategory.map((entry) => (
                          <Cell key={entry.categoryId} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => money(value, "USD")} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <div className="panel p-4">
                <h2 className="mb-4 text-base font-bold text-ink dark:text-white">Top 5 gastos</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topCategories}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value) => money(value, "USD")} />
                      <Bar dataKey="total" fill="#ef6351" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="panel p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-bold text-ink dark:text-white">Presupuestos</h2>
                  {Number(data.balanceDelta || 0) >= 0 ? <ArrowUpRight className="text-mint" /> : <ArrowDownRight className="text-coral" />}
                </div>
                <div className="space-y-3">
                  {data.budgetStatus.length ? data.budgetStatus.map((budget) => <BudgetProgress key={budget.id} budget={budget} currency="USD" />) : <p className="text-sm text-slate-500">No hay presupuestos para este periodo.</p>}
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </>
  );
};
