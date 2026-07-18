import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Goal } from "lucide-react";
import { z } from "zod";
import { DateInput } from "../components/DateInput.jsx";
import { ErrorPanel, LoadingPanel, LoadingSpinner } from "../components/LoadStates.jsx";
import { MoneyInput } from "../components/MoneyInput.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { FieldError, FormGrid } from "../components/forms.jsx";
import { endpoints } from "../services/api.js";
import { queryClient } from "../store/queryClient.js";
import { useAuth } from "../store/AuthProvider.jsx";
import { toast } from "../store/toastStore.js";
import { money, percent, today } from "../utils/formatters.js";

const schema = z.object({
  name: z.string().min(2, "Minimo 2 caracteres"),
  targetAmount: z.coerce.number().positive("Monto requerido"),
  targetDate: z.string().optional()
});

const contributionSchema = z.object({
  amount: z.coerce.number().positive("Aporte requerido"),
  contributionDate: z.string().min(10, "Fecha requerida")
});

const SavingsGoalCard = ({ goal, user }) => {
  const contributionForm = useForm({ resolver: zodResolver(contributionSchema), defaultValues: { amount: "", contributionDate: today() } });
  const contributionMutation = useMutation({
    mutationFn: ({ id, values }) => endpoints.savings.contribute(id, values),
    onSuccess: () => {
      contributionForm.reset({ amount: "", contributionDate: today() });
      queryClient.invalidateQueries({ queryKey: ["savings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Aporte registrado", "El aporte se sumo correctamente.");
    }
  });

  return (
    <article className="panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-ink dark:text-white">{goal.name}</h2>
          <p className="text-sm text-slate-500">{money(goal.currentAmount, user?.currency)} de {money(goal.targetAmount, user?.currency)}</p>
        </div>
        <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">{percent(goal.progress)}</span>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full bg-mint" style={{ width: `${Math.min(goal.progress, 100)}%` }} />
      </div>
      {goal.suggestedPerPeriod ? <p className="mt-3 text-sm text-slate-500">Sugerido mensual: {money(goal.suggestedPerPeriod, user?.currency)}</p> : null}
      <form className="mt-4 grid gap-3" onSubmit={contributionForm.handleSubmit((values) => contributionMutation.mutate({ id: goal.id, values }))} aria-busy={contributionMutation.isPending}>
        <FormGrid>
          <div>
            <label className="label">Aporte</label>
            <Controller
              control={contributionForm.control}
              name="amount"
              render={({ field }) => <MoneyInput currency={user?.currency || "USD"} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />}
            />
            <FieldError message={contributionForm.formState.errors.amount?.message} />
          </div>
          <div>
            <label className="label">Fecha</label>
            <DateInput {...contributionForm.register("contributionDate")} />
            <FieldError message={contributionForm.formState.errors.contributionDate?.message} />
          </div>
        </FormGrid>
        <button className="btn-secondary w-full sm:w-auto sm:justify-self-end" type="submit" disabled={contributionMutation.isPending}>
          {contributionMutation.isPending ? <LoadingSpinner label="Sumando aporte..." className="text-current" /> : null}
          {contributionMutation.isPending ? "Sumando..." : "Sumar aporte"}
        </button>
      </form>
    </article>
  );
};

export const SavingsPage = () => {
  const { user } = useAuth();
  const goals = useQuery({ queryKey: ["savings"], queryFn: endpoints.savings.list });
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: "", targetAmount: "", targetDate: "" } });
  const createMutation = useMutation({
    mutationFn: endpoints.savings.create,
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["savings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Meta creada", "La meta de ahorro se guardo correctamente.");
    }
  });

  return (
    <>
      <PageHeader
        title="Ahorro"
        description="Crea metas, registra aportes y revisa cuanto falta por periodo."
        action={
          <button className="btn-primary" type="submit" form="saving-form" disabled={createMutation.isPending}>
            {createMutation.isPending ? <LoadingSpinner label="Creando meta..." className="text-current" /> : <Goal size={17} />}
            {createMutation.isPending ? "Creando..." : "Crear meta"}
          </button>
        }
      />
      <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[360px_1fr]">
        <section className="panel p-4">
          <form id="saving-form" className="space-y-4" onSubmit={form.handleSubmit((values) => createMutation.mutate({ ...values, targetDate: values.targetDate || null }))} aria-busy={createMutation.isPending}>
            <div>
              <label className="label">Meta</label>
              <input className="field" {...form.register("name")} />
              <FieldError message={form.formState.errors.name?.message} />
            </div>
            <FormGrid>
              <div>
                <label className="label">Objetivo</label>
                <Controller
                  control={form.control}
                  name="targetAmount"
                  render={({ field }) => <MoneyInput currency={user?.currency || "USD"} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />}
                />
                <FieldError message={form.formState.errors.targetAmount?.message} />
              </div>
              <div>
                <label className="label">Fecha limite</label>
                <DateInput {...form.register("targetDate")} />
              </div>
            </FormGrid>
            {createMutation.isError ? <ErrorPanel error={createMutation.error} /> : null}
          </form>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          {goals.isLoading ? <LoadingPanel /> : null}
          {goals.isError ? <ErrorPanel error={goals.error} /> : null}
          {(goals.data?.data || []).map((goal) => (
            <SavingsGoalCard key={goal.id} goal={goal} user={user} />
          ))}
        </section>
      </div>
    </>
  );
};
