import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { z } from "zod";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { ErrorPanel, LoadingPanel, LoadingSpinner } from "../components/LoadStates.jsx";
import { MoneyInput } from "../components/MoneyInput.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { FieldError, FormGrid } from "../components/forms.jsx";
import { endpoints } from "../services/api.js";
import { queryClient } from "../store/queryClient.js";
import { toast } from "../store/toastStore.js";

const schema = z.object({
  currency: z.string().min(3, "Minimo 3 caracteres").max(5, "Maximo 5 caracteres"),
  bankBalanceBs: z.coerce.number().min(0, "No puede ser negativo"),
  periodType: z.enum(["monthly", "biweekly", "daily"]),
  firstCut: z.coerce.number().min(1, "Minimo 1").max(28, "Maximo 28")
});

export const SettingsPage = () => {
  const [pendingValues, setPendingValues] = useState(null);
  const settings = useQuery({ queryKey: ["settings"], queryFn: endpoints.user.settings });
  const form = useForm({
    resolver: zodResolver(schema),
    values: settings.data?.data ? {
      currency: settings.data.data.currency,
      bankBalanceBs: Number(settings.data.data.bankBalanceBs || 0),
      periodType: settings.data.data.periodType,
      firstCut: settings.data.data.biweeklyConfig?.firstCut || settings.data.data.biweeklyConfig?.first_cut || 15
    } : { currency: "MXN", bankBalanceBs: 0, periodType: "monthly", firstCut: 15 }
  });
  const mutation = useMutation({
    mutationFn: (values) => endpoints.user.updateSettings({
      currency: values.currency,
      bankBalanceBs: Number(values.bankBalanceBs || 0),
      periodType: values.periodType,
      biweeklyConfig: { firstCut: Number(values.firstCut), secondCut: "end_of_month" }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Configuracion guardada", "Tus preferencias se actualizaron correctamente.");
    }
  });
  const confirmSave = () => {
    if (!pendingValues) return;
    mutation.mutate(pendingValues, { onSettled: () => setPendingValues(null) });
  };

  return (
    <>
      <PageHeader
        title="Configuracion"
        description="Moneda base, agrupacion financiera y cortes de quincena."
        action={
          <button className="btn-primary" type="submit" form="settings-form" disabled={mutation.isPending}>
            {mutation.isPending ? <LoadingSpinner label="Guardando configuracion..." className="text-current" /> : <Save size={17} />}
            {mutation.isPending ? "Guardando..." : "Guardar"}
          </button>
        }
      />
      <div className="max-w-3xl p-4 sm:p-6">
        {settings.isLoading ? <LoadingPanel /> : null}
        {settings.isError ? <ErrorPanel error={settings.error} /> : null}
        <section className="panel p-4">
          <form id="settings-form" className="space-y-4" onSubmit={form.handleSubmit((values) => setPendingValues(values))} aria-busy={mutation.isPending}>
            <FormGrid>
              <div>
                <label className="label">Moneda</label>
                <input className="field" {...form.register("currency")} />
                <FieldError message={form.formState.errors.currency?.message} />
              </div>
              <div>
                <label className="label">Periodo por defecto</label>
                <select className="field" {...form.register("periodType")}>
                  <option value="monthly">Mensual</option>
                  <option value="biweekly">Quincenal</option>
                  <option value="daily">Diario</option>
                </select>
                <FieldError message={form.formState.errors.periodType?.message} />
              </div>
            </FormGrid>
            <div>
              <label className="label">Disponible en banco Bs</label>
              <Controller
                control={form.control}
                name="bankBalanceBs"
                render={({ field }) => <MoneyInput currency="VES" value={field.value} onChange={field.onChange} onBlur={field.onBlur} />}
              />
              <FieldError message={form.formState.errors.bankBalanceBs?.message} />
            </div>
            <div>
              <label className="label">Primer corte de quincena</label>
              <input className="field max-w-40" type="number" min="1" max="28" {...form.register("firstCut")} />
              <FieldError message={form.formState.errors.firstCut?.message} />
            </div>
            {mutation.isError ? <ErrorPanel error={mutation.error} /> : null}
            {mutation.isSuccess ? <p className="rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">Configuracion guardada.</p> : null}
          </form>
        </section>
      </div>
      <ConfirmDialog
        open={Boolean(pendingValues)}
        title="Guardar configuracion"
        description="Confirma que quieres aplicar estos cambios a tus preferencias."
        confirmLabel="Guardar"
        tone="default"
        isLoading={mutation.isPending}
        onClose={() => setPendingValues(null)}
        onConfirm={confirmSave}
      />
    </>
  );
};
