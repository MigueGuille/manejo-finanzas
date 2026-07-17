import { useSyncExternalStore } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { dismissToast, getToasts, subscribeToasts } from "../store/toastStore.js";

export const Toaster = () => {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, getToasts);

  return (
    <div className="fixed right-4 top-4 z-[70] grid w-[calc(100%-2rem)] max-w-sm gap-3 sm:right-6 sm:top-6" aria-live="polite" aria-atomic="true">
      {toasts.map((item) => {
        const isError = item.type === "error";
        const Icon = isError ? XCircle : CheckCircle2;

        return (
          <section
            className={`toast-item flex items-start gap-3 rounded-lg border bg-white p-4 shadow-xl dark:bg-slate-900 ${
              isError ? "border-rose-200 text-rose-700 dark:border-rose-900 dark:text-rose-200" : "border-emerald-200 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200"
            }`}
            key={item.id}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink dark:text-white">{item.title}</p>
              {item.message ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{item.message}</p> : null}
            </div>
            <button className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800" type="button" title="Cerrar" onClick={() => dismissToast(item.id)}>
              <X size={16} />
            </button>
          </section>
        );
      })}
    </div>
  );
};
