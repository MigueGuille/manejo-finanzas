import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { ErrorPanel, LoadingPanel } from "../components/LoadStates.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { FormGrid } from "../components/forms.jsx";
import { endpoints } from "../services/api.js";
import { queryClient } from "../store/queryClient.js";

export const SettingsPage = () => {
  const settings = useQuery({ queryKey: ["settings"], queryFn: endpoints.user.settings });
  const form = useForm({ values: settings.data?.data ? {
    currency: settings.data.data.currency,
    periodType: settings.data.data.periodType,
    firstCut: settings.data.data.biweeklyConfig?.firstCut || settings.data.data.biweeklyConfig?.first_cut || 15
  } : { currency: "MXN", periodType: "monthly", firstCut: 15 } });
  const mutation = useMutation({
    mutationFn: (values) => endpoints.user.updateSettings({
      currency: values.currency,
      periodType: values.periodType,
      biweeklyConfig: { firstCut: Number(values.firstCut), secondCut: "end_of_month" }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    }
  });

  return (
    <>
      <PageHeader title="Configuracion" description="Moneda base, agrupacion financiera y cortes de quincena." action={<button className="btn-primary" type="submit" form="settings-form"><Save size={17} /> Guardar</button>} />
      <div className="max-w-3xl p-4 sm:p-6">
        {settings.isLoading ? <LoadingPanel /> : null}
        {settings.isError ? <ErrorPanel error={settings.error} /> : null}
        <section className="panel p-4">
          <form id="settings-form" className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <FormGrid>
              <div>
                <label className="label">Moneda</label>
                <input className="field" {...form.register("currency")} />
              </div>
              <div>
                <label className="label">Periodo por defecto</label>
                <select className="field" {...form.register("periodType")}>
                  <option value="monthly">Mensual</option>
                  <option value="biweekly">Quincenal</option>
                  <option value="daily">Diario</option>
                </select>
              </div>
            </FormGrid>
            <div>
              <label className="label">Primer corte de quincena</label>
              <input className="field max-w-40" type="number" min="1" max="28" {...form.register("firstCut")} />
            </div>
            {mutation.isError ? <ErrorPanel error={mutation.error} /> : null}
            {mutation.isSuccess ? <p className="rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">Configuracion guardada.</p> : null}
          </form>
        </section>
      </div>
    </>
  );
};

