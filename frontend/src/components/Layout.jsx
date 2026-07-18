import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, CalendarClock, CreditCard, FolderKanban, Goal, LayoutDashboard, LogOut, Moon, Settings, Sun, WalletCards } from "lucide-react";
import { useAuth } from "../store/AuthProvider.jsx";
import { useTheme } from "../store/ThemeProvider.jsx";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transacciones", label: "Transacciones", icon: CreditCard },
  { to: "/categorias", label: "Categorias", icon: FolderKanban },
  { to: "/presupuestos", label: "Presupuestos", icon: WalletCards },
  { to: "/ahorro", label: "Ahorro", icon: Goal },
  { to: "/historico", label: "Historico", icon: BarChart3 },
  { to: "/configuracion", label: "Config", icon: Settings }
];

const ThemeButton = ({ compact = false }) => {
  const { isDark, toggleTheme } = useTheme();
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 ${compact ? "w-10 px-0" : ""}`}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      onClick={toggleTheme}
    >
      <Icon size={18} />
      {compact ? null : <span>{isDark ? "Claro" : "Oscuro"}</span>}
    </button>
  );
};

const NavItems = ({ mobile = false }) =>
  links.map(({ to, label, icon: Icon }) => (
    <NavLink
      key={to}
      to={to}
      end={to === "/"}
      title={label}
      className={({ isActive }) =>
        mobile
          ? `flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-bold ${
              isActive ? "bg-ink text-white dark:bg-mint dark:text-ink" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
            }`
          : `flex min-h-12 items-center gap-3 rounded-md px-3 text-sm font-semibold ${
              isActive ? "bg-ink text-white dark:bg-mint dark:text-ink" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
            }`
      }
    >
      <Icon size={19} />
      <span>{label}</span>
    </NavLink>
  ));

export const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-surface dark:bg-slate-950 dark:text-slate-100">
      <header className="mobile-app-header fixed inset-x-0 top-0 z-40 border-b border-line bg-white/95 px-3 pb-2 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 md:hidden">
        <div className="flex min-h-14 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink text-white dark:bg-mint dark:text-ink">
              <CalendarClock size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink dark:text-white">Finanzas</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeButton compact />
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-md border border-line bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              title="Salir"
              onClick={logout}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
        <nav className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
          <NavItems mobile />
        </nav>
      </header>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-white dark:border-slate-800 dark:bg-slate-950 md:block">
        <div className="flex h-20 items-center gap-3 px-5">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white dark:bg-mint dark:text-ink">
            <CalendarClock size={21} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink dark:text-white">Finanzas</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          <NavItems />
        </nav>
        <div className="absolute inset-x-0 bottom-0 grid gap-2 border-t border-line p-3 dark:border-slate-800">
          <ThemeButton />
          <button
            type="button"
            className="flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
            onClick={logout}
          >
            <LogOut size={18} /> Salir
          </button>
        </div>
      </aside>

      <main className="mobile-main-offset md:ml-64 md:pb-0 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
};
