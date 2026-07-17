import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeDollarSign, Pencil, Trash2, X } from "lucide-react";
import { z } from "zod";
import { BudgetProgress } from "../components/BudgetProgress.jsx";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { ErrorPanel, LoadingPanel, LoadingSpinner } from "../components/LoadStates.jsx";
import { MoneyInput } from "../components/MoneyInput.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { FieldError, FormGrid } from "../components/forms.jsx";
import { endpoints } from "../services/api.js";
import { queryClient } from "../store/queryClient.js";
import { toast } from "../store/toastStore.js";

const toDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getPeriodRange = (periodType, anchor = new Date()) => {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const day = anchor.getDate();

  if (periodType === "daily") {
    return { periodStart: toDateInput(anchor), periodEnd: toDateInput(anchor) };
  }

  if (periodType === "biweekly") {
    const start = day <= 15 ? new Date(year, month, 1) : new Date(year, month, 16);
    const end = day <= 15 ? new Date(year, month, 15) : new Date(year, month + 1, 0);
    return { periodStart: toDateInput(start), periodEnd: toDateInput(end) };
  }

  return {
    periodStart: toDateInput(new Date(year, month, 1)),
    periodEnd: toDateInput(new Date(year, month + 1, 0))
  };
};

const defaultValues = () => ({
  categoryId: "",
  periodType: "monthly",
  amountLimit: 0,
  ...getPeriodRange("monthly")
});

const schema = z.object({
  categoryId: z.string().min(1, "Selecciona una categoria"),
  periodType: z.enum(["daily", "biweekly", "monthly"]),
  amountLimit: z.coerce.number().positive("Monto requerido"),
  periodStart: z.string().min(10),
  periodEnd: z.string().min(10)
});

const periodOptions = [
  { value: "monthly", label: "Mensualidad", hint: "1 al fin del mes" },
  { value: "biweekly", label: "Quincenal", hint: "1-15 o 16-fin" },
  { value: "daily", label: "Diario", hint: "Solo hoy" }
];

export const BudgetsPage = () => {
  const [editingBudget, setEditingBudget] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const budgets = useQuery({ queryKey: ["budgets"], queryFn: endpoints.budgets.list });
  const categories = useQuery({ queryKey: ["categories"], queryFn: endpoints.categories.list });
  const expenseCategories = (categories.data?.data || []).filter((category) => category.type === "expense");
  const form = useForm({ resolver: zodResolver(schema), defaultValues: defaultValues() });
  const selectedPeriodType = form.watch("periodType");
  const selectedAmount = Number(form.watch("amountLimit") || 0);

  const invalidateBudgets = () => {
    queryClient.invalidateQueries({ queryKey: ["budgets"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
  };

  const createMutation = useMutation({
    mutationFn: endpoints.budgets.create,
    onSuccess: () => {
      form.reset(defaultValues());
      invalidateBudgets();
      toast.success("Presupuesto creado", "El limite se guardo correctamente.");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }) => endpoints.budgets.update(id, values),
    onSuccess: () => {
      setEditingBudget(null);
      form.reset(defaultValues());
      invalidateBudgets();
      toast.success("Presupuesto actualizado", "Los cambios se guardaron correctamente.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: endpoints.budgets.remove,
    onSuccess: () => {
      invalidateBudgets();
      toast.success("Presupuesto eliminado", "El presupuesto fue borrado correctamente.");
    }
  });

  const setPeriodType = (periodType) => {
    form.setValue("periodType", periodType, { shouldValidate: true });
    const range = getPeriodRange(periodType);
    form.setValue("periodStart", range.periodStart, { shouldValidate: true });
    form.setValue("periodEnd", range.periodEnd, { shouldValidate: true });
  };

  const startEdit = (budget) => {
    setEditingBudget(budget);
    form.reset({
      categoryId: budget.categoryId,
      periodType: budget.periodType,
      amountLimit: Number(budget.amountLimit || 0),
      periodStart: String(budget.periodStart).slice(0, 10),
      periodEnd: String(budget.periodEnd).slice(0, 10)
    });
  };

  const cancelEdit = () => {
    setEditingBudget(null);
    form.reset(defaultValues());
  };

  const submit = (values) => {
    if (editingBudget) setConfirmAction({ type: "update", values });
    else createMutation.mutate(values);
  };

  const activeMutation = editingBudget ? updateMutation : createMutation;
  const confirmIsLoading = confirmAction?.type === "delete" ? deleteMutation.isPending : updateMutation.isPending;
  const confirmBudgetAction = () => {
    if (!confirmAction) return;

    if (confirmAction.type === "delete") {
      deleteMutation.mutate(confirmAction.budget.id, { onSettled: () => setConfirmAction(null) });
      return;
    }

    updateMutation.mutate({ id: editingBudget.id, values: confirmAction.values }, { onSettled: () => setConfirmAction(null) });
  };

  return (
    <>
      <PageHeader
        title="Presupuestos"
        description="Controla limites por categoria como mensualidad, quincena o gasto diario."
        action={
          <div className="flex gap-2">
            {editingBudget ? (
              <button className="btn-secondary" type="button" onClick={cancelEdit}>
                <X size={17} /> Cancelar
              </button>
            ) : null}
            <button className="btn-primary" type="submit" form="budget-form" disabled={activeMutation.isPending}>
              {activeMutation.isPending ? <LoadingSpinner label="Procesando presupuesto..." className="text-current" /> : <BadgeDollarSign size={17} />}
              {activeMutation.isPending ? (editingBudget ? "Guardando..." : "Creando...") : editingBudget ? "Guardar" : "Crear"}
            </button>
          </div>
        }
      />
      <div className="grid gap-5 p-3 sm:p-6 lg:grid-cols-[420px_1fr]">
        <section className="panel p-4">
          <form id="budget-form" className="space-y-4" onSubmit={form.handleSubmit(submit)} aria-busy={activeMutation.isPending}>
            <div>
              <h2 className="font-bold text-ink dark:text-white">{editingBudget ? "Editar presupuesto" : "Nuevo presupuesto"}</h2>
              <p className="mt-1 text-sm text-slate-500">Los limites se guardan en USD para comparar gastos en USD/Bs.</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`min-h-16 rounded-md border px-3 py-2 text-left transition ${
                    selectedPeriodType === option.value
                      ? "border-ink bg-ink text-white dark:border-mint dark:bg-mint dark:text-ink"
                      : "border-line bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                  }`}
                  onClick={() => setPeriodType(option.value)}
                >
                  <span className="block text-sm font-bold">{option.label}</span>
                  <span className="block text-xs opacity-75">{option.hint}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="label">Categoria</label>
              <select className="field" {...form.register("categoryId")}>
                <option value="">Selecciona</option>
                {expenseCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <FieldError message={form.formState.errors.categoryId?.message} />
            </div>

            <FormGrid>
              <div>
                <label className="label">Limite USD</label>
                <Controller
                  control={form.control}
                  name="amountLimit"
                  render={({ field }) => <MoneyInput currency="USD" value={field.value} onChange={field.onChange} />}
                />
                <FieldError message={form.formState.errors.amountLimit?.message} />
              </div>
              <div className="rounded-lg border border-line bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-xs font-semibold uppercase text-slate-500">Vista rapida</span>
                <p className="mt-2 text-xl font-bold text-ink dark:text-white">${selectedAmount.toFixed(2)}</p>
                <p className="text-xs text-slate-500">{periodOptions.find((option) => option.value === selectedPeriodType)?.label}</p>
              </div>
            </FormGrid>

            <FormGrid>
              <div>
                <label className="label">Inicio</label>
                <input className="field" type="date" {...form.register("periodStart")} />
              </div>
              <div>
                <label className="label">Fin</label>
                <input className="field" type="date" {...form.register("periodEnd")} />
              </div>
            </FormGrid>

            {activeMutation.isError ? <ErrorPanel error={activeMutation.error} /> : null}
            {deleteMutation.isError ? <ErrorPanel error={deleteMutation.error} /> : null}
          </form>
        </section>

        <section className="space-y-3">
          {budgets.isLoading ? <LoadingPanel /> : null}
          {budgets.isError ? <ErrorPanel error={budgets.error} /> : null}
          {(budgets.data?.data || []).map((budget) => (
            <BudgetProgress
              key={budget.id}
              budget={budget}
              currency="USD"
              actions={
                <div className="flex gap-1">
                  <button
                    className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    type="button"
                    title="Editar"
                    onClick={() => startEdit(budget)}
                    disabled={deleteMutation.isPending || updateMutation.isPending}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="rounded-md p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    type="button"
                    title="Eliminar"
                    onClick={() => setConfirmAction({ type: "delete", budget })}
                    disabled={deleteMutation.isPending || updateMutation.isPending}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              }
            />
          ))}
        </section>
      </div>
      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={confirmAction?.type === "delete" ? "Eliminar presupuesto" : "Guardar cambios"}
        description={
          confirmAction?.type === "delete"
            ? `Vas a borrar el presupuesto de "${confirmAction?.budget?.category?.name || "esta categoria"}". Esta accion no se puede deshacer.`
            : "Confirma que quieres reemplazar los valores actuales de este presupuesto."
        }
        confirmLabel={confirmAction?.type === "delete" ? "Eliminar" : "Guardar cambios"}
        tone={confirmAction?.type === "delete" ? "danger" : "default"}
        isLoading={confirmIsLoading}
        onClose={() => setConfirmAction(null)}
        onConfirm={confirmBudgetAction}
      />
    </>
  );
};
