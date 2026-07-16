export const PageHeader = ({ title, description, action }) => (
  <header className="flex flex-col gap-4 border-b border-line bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <h1 className="text-2xl font-bold text-ink dark:text-white">{title}</h1>
      {description ? <p className="mt-1 max-w-3xl text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
    </div>
    {action ? <div className="flex w-full sm:w-auto [&>*]:w-full sm:[&>*]:w-auto">{action}</div> : null}
  </header>
);
