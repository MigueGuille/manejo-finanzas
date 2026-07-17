import { useSyncExternalStore } from "react";
import { LoaderCircle } from "lucide-react";
import { getActiveRequestCount, subscribeRequestActivity } from "../services/api.js";

export const LoadingSpinner = ({ label = "Cargando...", className = "" }) => (
  <span className={`inline-flex items-center justify-center ${className}`} role="status" aria-label={label}>
    <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
    <span className="sr-only">{label}</span>
  </span>
);

export const FullPageLoader = ({ label = "Cargando..." }) => (
  <main className="grid min-h-screen place-items-center bg-surface px-4 dark:bg-slate-950">
    <div className="flex flex-col items-center gap-4 text-ink dark:text-mint">
      <div className="grid h-16 w-16 place-items-center rounded-full border border-line bg-white shadow-panel dark:border-slate-800 dark:bg-slate-900">
        <LoadingSpinner label={label} className="text-ink dark:text-mint" />
      </div>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">{label}</p>
    </div>
  </main>
);

export const GlobalRequestLoader = () => {
  const activeRequests = useSyncExternalStore(subscribeRequestActivity, getActiveRequestCount, getActiveRequestCount);

  if (!activeRequests) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-surface px-4 dark:bg-slate-950" role="status" aria-live="polite" aria-label="Cargando contenido">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full">
          <LoaderCircle className="h-8 w-8 animate-spin text-ink dark:text-mint" aria-hidden="true" />
        </div>
        <div>
          {/* <p className="text-sm font-bold text-ink dark:text-white">Cargando contenido...</p> */}
          {/* <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-300">Espera mientras se completa la peticion.</p> */}
        </div>
      </div>
    </div>
  );
};

export const LoadingPanel = ({ label = "Cargando datos..." }) => (
  <div className="panel p-5">
    <div className="mb-4 flex items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-300">
      <LoadingSpinner label={label} className="text-ink dark:text-mint" />
      <span>{label}</span>
    </div>
    <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
    <div className="mt-4 grid gap-3">
      <div className="h-9 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-9 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-9 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
    </div>
  </div>
);

export const ErrorPanel = ({ error }) => (
  <div className="panel border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
    {error?.message || "No se pudo cargar la informacion."}
  </div>
);
