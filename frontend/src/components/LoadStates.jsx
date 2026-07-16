export const LoadingPanel = ({ label = "Cargando datos..." }) => (
  <div className="panel p-5">
    <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
    <div className="mt-4 grid gap-3">
      <div className="h-9 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-9 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-9 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
    </div>
    <p className="sr-only">{label}</p>
  </div>
);

export const ErrorPanel = ({ error }) => (
  <div className="panel border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
    {error?.message || "No se pudo cargar la informacion."}
  </div>
);

