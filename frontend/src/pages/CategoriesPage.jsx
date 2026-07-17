import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CirclePlus, Trash2 } from "lucide-react";
import { z } from "zod";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { ErrorPanel, LoadingPanel, LoadingSpinner } from "../components/LoadStates.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { FieldError, FormGrid } from "../components/forms.jsx";
import { endpoints } from "../services/api.js";
import { queryClient } from "../store/queryClient.js";
import { toast } from "../store/toastStore.js";

const schema = z.object({
  name: z.string().min(2),
  type: z.enum(["income", "expense"]),
  color: z.string().min(3),
  icon: z.string().optional(),
  isEssential: z.boolean().optional()
});

export const CategoriesPage = () => {
  const [confirmDelete, setConfirmDelete] = useState(null);
  const categories = useQuery({ queryKey: ["categories"], queryFn: endpoints.categories.list });
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: "", type: "expense", color: "#10b981", icon: "Tag", isEssential: false } });
  const createMutation = useMutation({
    mutationFn: endpoints.categories.create,
    onSuccess: () => {
      form.reset({ name: "", type: "expense", color: "#10b981", icon: "Tag", isEssential: false });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria creada", "La categoria se guardo correctamente.");
    }
  });
  const deleteMutation = useMutation({
    mutationFn: endpoints.categories.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria eliminada", "La categoria fue borrada correctamente.");
    }
  });
  const confirmDeleteCategory = () => {
    if (!confirmDelete) return;
    deleteMutation.mutate(confirmDelete.id, { onSettled: () => setConfirmDelete(null) });
  };

  return (
    <>
      <PageHeader
        title="Categorias"
        description="Personaliza agrupaciones, colores y si son esenciales para analisis de gasto."
        action={
          <button className="btn-primary" type="submit" form="category-form" disabled={createMutation.isPending}>
            {createMutation.isPending ? <LoadingSpinner label="Creando categoria..." className="text-current" /> : <CirclePlus size={17} />}
            {createMutation.isPending ? "Creando..." : "Crear"}
          </button>
        }
      />
      <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[360px_1fr]">
        <section className="panel p-4">
          <form id="category-form" className="space-y-4" onSubmit={form.handleSubmit((values) => createMutation.mutate(values))} aria-busy={createMutation.isPending}>
            <div>
              <label className="label">Nombre</label>
              <input className="field" {...form.register("name")} />
              <FieldError message={form.formState.errors.name?.message} />
            </div>
            <FormGrid>
              <div>
                <label className="label">Tipo</label>
                <select className="field" {...form.register("type")}>
                  <option value="expense">Gasto</option>
                  <option value="income">Ingreso</option>
                </select>
              </div>
              <div>
                <label className="label">Color</label>
                <input className="field h-10" type="color" {...form.register("color")} />
              </div>
            </FormGrid>
            <div>
              <label className="label">Icono</label>
              <input className="field" placeholder="Tag, Home, Car..." {...form.register("icon")} />
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <input type="checkbox" {...form.register("isEssential")} /> Categoria esencial
            </label>
            {createMutation.isError ? <ErrorPanel error={createMutation.error} /> : null}
          </form>
        </section>

        <section>
          {categories.isLoading ? <LoadingPanel /> : null}
          {categories.isError ? <ErrorPanel error={categories.error} /> : null}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(categories.data?.data || []).map((category) => (
              <article className="panel p-4" key={category.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color || "#64748b" }} />
                    <div>
                      <h2 className="font-bold text-ink dark:text-white">{category.name}</h2>
                      <p className="text-sm text-slate-500">{category.type === "expense" ? "Gasto" : "Ingreso"} {category.isEssential ? "esencial" : "variable"}</p>
                    </div>
                  </div>
                  <button className="rounded-md p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50" type="button" title="Eliminar" onClick={() => setConfirmDelete(category)} disabled={deleteMutation.isPending}>
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
          {deleteMutation.isError ? <ErrorPanel error={deleteMutation.error} /> : null}
        </section>
      </div>
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Eliminar categoria"
        description={`Vas a borrar "${confirmDelete?.name || "esta categoria"}". Si tiene movimientos asociados, el servidor podria rechazar la accion.`}
        confirmLabel="Eliminar"
        isLoading={deleteMutation.isPending}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteCategory}
      />
    </>
  );
};
