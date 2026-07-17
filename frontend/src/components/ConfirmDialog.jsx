import { AlertTriangle, LoaderCircle, X } from "lucide-react";

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "danger",
  isLoading = false,
  onConfirm,
  onClose
}) => {
  if (!open) return null;

  const confirmClass =
    tone === "danger"
      ? "bg-rose-600 text-white hover:bg-rose-700"
      : "bg-ink text-white hover:bg-slate-700 dark:bg-mint dark:text-ink dark:hover:bg-emerald-300";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <section className="panel w-full max-w-md p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full ${tone === "danger" ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-700"}`}>
              <AlertTriangle size={20} />
            </span>
            <div>
              <h2 id="confirm-title" className="text-base font-bold text-ink dark:text-white">
                {title}
              </h2>
              {description ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{description}</p> : null}
            </div>
          </div>
          <button className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" type="button" title="Cerrar" onClick={onClose} disabled={isLoading}>
            <X size={18} />
          </button>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button className="btn-secondary" type="button" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </button>
          <button className={`btn ${confirmClass}`} type="button" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Procesando..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
};
