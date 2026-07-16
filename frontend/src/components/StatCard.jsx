export const StatCard = ({ label, value, tone = "neutral", meta }) => {
  const tones = {
    neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    income: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
    expense: "bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300",
    balance: "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"
  };

  return (
    <article className="panel p-4">
      <p className="text-xs font-semibold uppercase tracking-normal text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-bold text-ink dark:text-white">{value}</p>
      {meta ? <p className={`mt-3 inline-flex rounded-md px-2 py-1 text-xs font-semibold ${tones[tone]}`}>{meta}</p> : null}
    </article>
  );
};

