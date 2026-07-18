import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, Trash2 } from "lucide-react";
import { z } from "zod";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { DateInput } from "../components/DateInput.jsx";
import { ErrorPanel, LoadingPanel, LoadingSpinner } from "../components/LoadStates.jsx";
import { MoneyInput } from "../components/MoneyInput.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { FieldError, FormGrid } from "../components/forms.jsx";
import { endpoints } from "../services/api.js";
import { queryClient } from "../store/queryClient.js";
import { toast } from "../store/toastStore.js";
import { currencyLabel, money, today } from "../utils/formatters.js";

const schema = z.object({
  type: z.enum(["income", "expense"]),
  categoryId: z.string().min(1, "Selecciona una categoria"),
  budgetId: z.string().optional(),
  amount: z.coerce.number().positive("Monto requerido"),
  currency: z.enum(["USD", "VES"]),
  exchangeRate: z.coerce.number().min(0).optional(),
  exchangeDifferenceBs: z.coerce.number().min(0).optional(),
  paymentMethod: z.string().optional(),
  description: z.string().optional(),
  transactionDate: z.string().min(10)
});

export const TransactionsPage = () => {
  const [filters, setFilters] = useState({ page: 1, pageSize: 20 });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const transactions = useQuery({ queryKey: ["transactions", filters], queryFn: () => endpoints.transactions.list(filters) });
  const categories = useQuery({ queryKey: ["categories"], queryFn: endpoints.categories.list });
  const budgets = useQuery({ queryKey: ["budgets"], queryFn: endpoints.budgets.list });
  const [type, setType] = useState("expense");
  const filteredCategories = useMemo(() => (categories.data?.data || []).filter((category) => category.type === type), [categories.data, type]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "expense",
      categoryId: "",
      budgetId: "",
      amount: 0,
      currency: "VES",
      exchangeRate: 0,
      exchangeDifferenceBs: 0,
      paymentMethod: "tarjeta",
      description: "",
      transactionDate: today()
    }
  });
  const watchedAmount = Number(form.watch("amount") || 0);
  const watchedCategoryId = form.watch("categoryId");
  const watchedCurrency = form.watch("currency");
  const watchedRate = Number(form.watch("exchangeRate") || 0);
  const watchedDifference = Number(form.watch("exchangeDifferenceBs") || 0);
  const previewUsd = watchedCurrency === "USD" ? watchedAmount : watchedRate > 0 ? watchedAmount / watchedRate : 0;
  const previewBs = watchedCurrency === "USD" ? watchedAmount * watchedRate : watchedAmount;

  const createMutation = useMutation({
    mutationFn: endpoints.transactions.create,
    onSuccess: () => {
      form.reset({
        type,
        categoryId: "",
        budgetId: "",
        amount: 0,
        currency: "VES",
        exchangeRate: watchedRate,
        exchangeDifferenceBs: 0,
        paymentMethod: "tarjeta",
        description: "",
        transactionDate: today()
      });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Transaccion guardada", "El movimiento se registro correctamente.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: endpoints.transactions.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Transaccion eliminada", "El movimiento fue borrado correctamente.");
    }
  });

  const eligibleBudgets = useMemo(
    () => (budgets.data?.data || []).filter((budget) => !budget.categoryId || budget.categoryId === watchedCategoryId),
    [budgets.data, watchedCategoryId]
  );
  const onSubmit = (values) =>
    createMutation.mutate({ ...values, budgetId: values.type === "expense" && values.budgetId ? values.budgetId : null, currency: values.currency === "BS" ? "VES" : values.currency });
  const confirmDeleteTransaction = () => {
    if (!confirmDelete) return;
    deleteMutation.mutate(confirmDelete.id, { onSettled: () => setConfirmDelete(null) });
  };
  const updateFilter = (patch) => setFilters((current) => ({ ...current, ...patch, page: 1 }));

  return (
    <>
      <PageHeader
        title="Transacciones"
        description="Registra ingresos y gastos en USD o Bs con tasa, equivalente y diferencial cambiario."
        action={
          <button className="btn-primary" type="submit" form="transaction-form" disabled={createMutation.isPending}>
            {createMutation.isPending ? <LoadingSpinner label="Agregando transaccion..." className="text-current" /> : <Plus size={17} />}
            {createMutation.isPending ? "Agregando..." : "Agregar"}
          </button>
        }
      />
      <div className="grid gap-5 p-3 sm:p-6 xl:grid-cols-[430px_1fr]">
        <section className="panel p-4">
          <h2 className="mb-4 font-bold text-ink dark:text-white">Nueva transaccion</h2>
          <form id="transaction-form" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} aria-busy={createMutation.isPending}>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {["expense", "income"].map((item) => (
                <button key={item} type="button" className={`min-h-11 rounded-md px-3 py-2 text-sm font-semibold ${type === item ? "bg-white shadow-sm dark:bg-slate-950" : "text-slate-500"}`} onClick={() => { setType(item); form.setValue("type", item); form.setValue("categoryId", ""); form.setValue("budgetId", ""); }}>
                  {item === "expense" ? "Gasto" : "Ingreso"}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["VES", "Bs"],
                ["USD", "USD"]
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`min-h-11 rounded-md border px-3 py-2 text-sm font-bold ${watchedCurrency === value ? "border-ink bg-ink text-white dark:border-mint dark:bg-mint dark:text-ink" : "border-line text-slate-600 dark:border-slate-700 dark:text-slate-300"}`}
                  onClick={() => form.setValue("currency", value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div>
              <label className="label">Monto original</label>
              <Controller
                control={form.control}
                name="amount"
                render={({ field }) => <MoneyInput currency={watchedCurrency} value={field.value} onChange={field.onChange} />}
              />
              <FieldError message={form.formState.errors.amount?.message} />
            </div>
            <FormGrid>
              <div>
                <label className="label">Tasa Bs/USD</label>
                <Controller
                  control={form.control}
                  name="exchangeRate"
                  render={({ field }) => <MoneyInput currency="VES" value={field.value} onChange={field.onChange} />}
                />
              </div>
              <div>
                <label className="label">Fecha</label>
                <DateInput {...form.register("transactionDate")} />
              </div>
            </FormGrid>
            <div>
              <label className="label">Diferencial cambiario en Bs</label>
              <Controller
                control={form.control}
                name="exchangeDifferenceBs"
                render={({ field }) => <MoneyInput currency="VES" value={field.value} onChange={field.onChange} />}
              />
            </div>
            <div className="grid gap-2 rounded-lg border border-line bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <span className="text-slate-500">Equivalente USD</span>
                <strong className="max-w-full text-right text-sm tabular-nums">{money(previewUsd, "USD")}</strong>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <span className="text-slate-500">Equivalente Bs</span>
                <strong className="max-w-full text-right text-sm tabular-nums">{money(previewBs, "VES")}</strong>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <span className="text-slate-500">Ajuste diferencial</span>
                <strong className="max-w-full text-right text-sm tabular-nums">{money(watchedDifference, "VES")}</strong>
              </div>
            </div>
            <div>
              <label className="label">Categoria</label>
              <select className="field" {...form.register("categoryId", { onChange: () => form.setValue("budgetId", "") })}>
                <option value="">Selecciona</option>
                {filteredCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <FieldError message={form.formState.errors.categoryId?.message} />
            </div>
            {type === "expense" ? (
              <div>
                <label className="label">Presupuesto</label>
                <select className="field" {...form.register("budgetId")} disabled={!watchedCategoryId}>
                  <option value="">Sin presupuesto</option>
                  {eligibleBudgets.map((budget) => (
                    <option key={budget.id} value={budget.id}>
                      {budget.name || budget.category?.name || "Presupuesto"}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">Los presupuestos manuales solo cuentan los gastos que asignes aqui.</p>
              </div>
            ) : null}
            <FormGrid>
              <div>
                <label className="label">Metodo</label>
                <input className="field" {...form.register("paymentMethod")} />
              </div>
              <div>
                <label className="label">Descripcion</label>
                <input className="field" {...form.register("description")} />
              </div>
            </FormGrid>
            {createMutation.isError ? <ErrorPanel error={createMutation.error} /> : null}
          </form>
        </section>

        <section className="space-y-4">
          <div className="panel grid gap-3 p-4 md:grid-cols-5">
            <div className="md:col-span-2">
              <label className="label">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
                <input className="field pl-9" onChange={(event) => updateFilter({ search: event.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Desde</label>
              <DateInput onChange={(event) => updateFilter({ from: event.target.value || undefined })} />
            </div>
            <div>
              <label className="label">Hasta</label>
              <DateInput onChange={(event) => updateFilter({ to: event.target.value || undefined })} />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select className="field" onChange={(event) => updateFilter({ type: event.target.value || undefined })}>
                <option value="">Todos</option>
                <option value="expense">Gastos</option>
                <option value="income">Ingresos</option>
              </select>
            </div>
          </div>

          {transactions.isLoading ? <LoadingPanel /> : null}
          {transactions.isError ? <ErrorPanel error={transactions.error} /> : null}
          <div className="grid gap-3 md:hidden">
            {(transactions.data?.data?.items || []).map((item) => (
              <article className="panel p-4" key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">{item.transactionDate.slice(0, 10)} · {item.type === "expense" ? "Gasto" : "Ingreso"}</p>
                    <h3 className="mt-1 font-bold text-ink dark:text-white">{item.category?.name}</h3>
                    {item.budget?.name ? <p className="mt-1 text-xs font-semibold text-slate-400">Presupuesto: {item.budget.name}</p> : null}
                    <p className="text-sm text-slate-500">{item.paymentMethod || "Sin metodo"} · {item.description || "Sin descripcion"}</p>
                  </div>
                  <button className="rounded-md p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50" type="button" title="Eliminar" onClick={() => setConfirmDelete(item)} disabled={deleteMutation.isPending}>
                    <Trash2 size={17} />
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md bg-slate-100 p-3 dark:bg-slate-800">
                    <span className="block text-xs text-slate-500">Original</span>
                    <strong className={item.type === "expense" ? "text-coral" : "text-mint"}>{money(item.amount, item.currency)}</strong>
                  </div>
                  <div className="rounded-md bg-slate-100 p-3 dark:bg-slate-800">
                    <span className="block text-xs text-slate-500">USD</span>
                    <strong>{money(item.amountUsd, "USD")}</strong>
                  </div>
                  <div className="rounded-md bg-slate-100 p-3 dark:bg-slate-800">
                    <span className="block text-xs text-slate-500">Bs</span>
                    <strong>{money(item.amountBs, "VES")}</strong>
                  </div>
                  <div className="rounded-md bg-slate-100 p-3 dark:bg-slate-800">
                    <span className="block text-xs text-slate-500">Dif. Bs</span>
                    <strong>{money(item.exchangeDifferenceBs, "VES")}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="panel hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-slate-500 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Metodo</th>
                    <th className="px-4 py-3">Presupuesto</th>
                    <th className="px-4 py-3 text-right">Original</th>
                    <th className="px-4 py-3 text-right">USD</th>
                    <th className="px-4 py-3 text-right">Bs</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line dark:divide-slate-800">
                  {(transactions.data?.data?.items || []).map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">{item.transactionDate.slice(0, 10)}</td>
                      <td className="px-4 py-3">{item.type === "expense" ? "Gasto" : "Ingreso"}</td>
                      <td className="px-4 py-3">{item.category?.name}</td>
                      <td className="px-4 py-3">{item.paymentMethod}</td>
                      <td className="px-4 py-3">{item.budget?.name || "-"}</td>
                      <td className={`px-4 py-3 text-right font-bold ${item.type === "expense" ? "text-coral" : "text-mint"}`}>{money(item.amount, item.currency)} <span className="text-xs text-slate-400">{currencyLabel(item.currency)}</span></td>
                      <td className="px-4 py-3 text-right font-semibold">{money(item.amountUsd, "USD")}</td>
                      <td className="px-4 py-3 text-right font-semibold">{money(item.amountBs, "VES")}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="rounded-md p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50" type="button" title="Eliminar" onClick={() => setConfirmDelete(item)} disabled={deleteMutation.isPending}>
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {deleteMutation.isError ? <ErrorPanel error={deleteMutation.error} /> : null}
        </section>
      </div>
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Eliminar transaccion"
        description={`Vas a borrar ${confirmDelete?.category?.name || "esta transaccion"}. Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar"
        isLoading={deleteMutation.isPending}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteTransaction}
      />
    </>
  );
};
