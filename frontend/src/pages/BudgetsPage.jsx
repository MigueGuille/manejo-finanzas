import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeDollarSign } from "lucide-react";
import { z } from "zod";
import { BudgetProgress } from "../components/BudgetProgress.jsx";
import { ErrorPanel, LoadingPanel } from "../components/LoadStates.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { FieldError, FormGrid } from "../components/forms.jsx";
import { endpoints } from "../services/api.js";
import { queryClient } from "../store/queryClient.js";
import { useAuth } from "../store/AuthProvider.jsx";
import { today } from "../utils/formatters.js";

const monthEnd = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().slice(0, 10);
};

const schema = z.object({
  categoryId: z.string().min(1),
  periodType: z.enum(["daily", "biweekly", "monthly"]),
  amountLimit: z.coerce.number().positive(),
  periodStart: z.string().min(10),
  periodEnd: z.string().min(10)
});

export const BudgetsPage = () => {
  const { user } = useAuth();
  const budgets = useQuery({ queryKey: ["budgets"], queryFn: endpoints.budgets.list });
  const categories = useQuery({ queryKey: ["categories"], queryFn: endpoints.categories.list });
  const expenseCategories = (categories.data?.data || []).filter((category) => category.type === "expense");
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { categoryId: "", periodType: "monthly", amountLimit: "", periodStart: today().slice(0, 8) + "01", periodEnd: monthEnd() } });
  const createMutation = useMutation({
    mutationFn: endpoints.budgets.create,
    onSuccess: () => {
      form.reset({ categoryId: "", periodType: "monthly", amountLimit: "", periodStart: today().slice(0, 8) + "01", periodEnd: monthEnd() });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    }
  });

  return (
    <>
      <PageHeader title="Presupuestos" description="Define limites por categoria y periodo para detectar sobregasto." action={<button className="btn-primary" type="submit" form="budget-form"><BadgeDollarSign size={17} /> Crear</button>} />
      <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[360px_1fr]">
        <section className="panel p-4">
          <form id="budget-form" className="space-y-4" onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}>
            <div>
              <label className="label">Categoria</label>
              <select className="field" {...form.register("categoryId")}>
                <option value="">Selecciona</option>
                {expenseCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <FieldError message={form.formState.errors.categoryId?.message} />
            </div>
            <FormGrid>
              <div>
                <label className="label">Periodo</label>
                <select className="field" {...form.register("periodType")}>
                  <option value="monthly">Mensual</option>
                  <option value="biweekly">Quincenal</option>
                  <option value="daily">Diario</option>
                </select>
              </div>
              <div>
                <label className="label">Limite</label>
                <input className="field" type="number" step="0.01" {...form.register("amountLimit")} />
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
            {createMutation.isError ? <ErrorPanel error={createMutation.error} /> : null}
          </form>
        </section>

        <section className="space-y-3">
          {budgets.isLoading ? <LoadingPanel /> : null}
          {budgets.isError ? <ErrorPanel error={budgets.error} /> : null}
          {(budgets.data?.data || []).map((budget) => <BudgetProgress key={budget.id} budget={budget} currency={user?.currency} />)}
        </section>
      </div>
    </>
  );
};

