import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CirclePlus, Trash2 } from "lucide-react";
import { z } from "zod";
import { ErrorPanel, LoadingPanel } from "../components/LoadStates.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { FieldError, FormGrid } from "../components/forms.jsx";
import { endpoints } from "../services/api.js";
import { queryClient } from "../store/queryClient.js";

const schema = z.object({
  name: z.string().min(2),
  type: z.enum(["income", "expense"]),
  color: z.string().min(3),
  icon: z.string().optional(),
  isEssential: z.boolean().optional()
});

export const CategoriesPage = () => {
  const categories = useQuery({ queryKey: ["categories"], queryFn: endpoints.categories.list });
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: "", type: "expense", color: "#10b981", icon: "Tag", isEssential: false } });
  const createMutation = useMutation({
    mutationFn: endpoints.categories.create,
    onSuccess: () => {
      form.reset({ name: "", type: "expense", color: "#10b981", icon: "Tag", isEssential: false });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    }
  });
  const deleteMutation = useMutation({
    mutationFn: endpoints.categories.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] })
  });

  return (
    <>
      <PageHeader title="Categorias" description="Personaliza agrupaciones, colores y si son esenciales para analisis de gasto." action={<button className="btn-primary" type="submit" form="category-form"><CirclePlus size={17} /> Crear</button>} />
      <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[360px_1fr]">
        <section className="panel p-4">
          <form id="category-form" className="space-y-4" onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}>
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
                  <button className="rounded-md p-2 text-slate-500 hover:bg-slate-100" title="Eliminar" onClick={() => deleteMutation.mutate(category.id)}>
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

