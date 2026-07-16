import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, CalendarClock, CreditCard, FolderKanban, Goal, LayoutDashboard, LogOut, Settings, WalletCards } from "lucide-react";
import { useAuth } from "../store/AuthProvider.jsx";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transacciones", label: "Transacciones", icon: CreditCard },
  { to: "/categorias", label: "Categorias", icon: FolderKanban },
  { to: "/presupuestos", label: "Presupuestos", icon: WalletCards },
  { to: "/ahorro", label: "Ahorro", icon: Goal },
  { to: "/historico", label: "Historico", icon: BarChart3 },
  { to: "/configuracion", label: "Config", icon: Settings }
];

export const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-surface dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white dark:border-slate-800 dark:bg-slate-950 md:inset-y-0 md:left-0 md:right-auto md:w-64 md:border-r md:border-t-0">
        <div className="hidden h-20 items-center gap-3 px-5 md:flex">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white dark:bg-mint dark:text-ink">
            <CalendarClock size={21} />
          </div>
          <div>
            <p className="text-sm font-bold">Finanzas</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
        <nav className="grid grid-cols-7 gap-1 p-2 md:block md:space-y-1 md:p-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              title={label}
              className={({ isActive }) =>
                `flex min-h-12 items-center justify-center gap-3 rounded-md px-2 text-xs font-semibold md:justify-start md:px-3 md:text-sm ${
                  isActive ? "bg-ink text-white dark:bg-mint dark:text-ink" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                }`
              }
            >
              <Icon size={19} />
              <span className="hidden md:inline">{label}</span>
            </NavLink>
          ))}
        </nav>
        <button type="button" className="mx-3 mt-4 hidden w-[calc(100%-1.5rem)] items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900 md:flex" onClick={logout}>
          <LogOut size={18} /> Salir
        </button>
      </aside>
      <main className="pb-24 md:ml-64 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
};

