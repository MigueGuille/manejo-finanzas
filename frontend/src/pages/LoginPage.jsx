import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Moon, PiggyBank, Sun } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadStates.jsx";
import { FieldError } from "../components/forms.jsx";
import { useAuth } from "../store/AuthProvider.jsx";
import { useTheme } from "../store/ThemeProvider.jsx";

const schema = z.object({
  email: z.string().email("Correo invalido"),
  password: z.string().min(8, "Minimo 8 caracteres"),
  currency: z.string().min(3).max(5).optional()
});

export const LoginPage = () => {
  const [mode, setMode] = useState("login");
  const [serverError, setServerError] = useState("");
  const location = useLocation();
  const { login, register, isAuthenticated, isReady } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const from = location.state?.from?.pathname ? `${location.state.from.pathname}${location.state.from.search || ""}` : "/";
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: "", password: "", currency: "MXN" } });

  if (isReady && isAuthenticated) return <Navigate to={from} replace />;

  const onSubmit = async (values) => {
    setServerError("");
    try {
      if (mode === "register") await register(values);
      else await login({ email: values.email, password: values.password });
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-surface px-4 py-8 dark:bg-slate-950">
      <button
        className="fixed right-4 top-4 grid h-10 w-10 place-items-center rounded-md border border-line bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        type="button"
        title={isDark ? "Modo claro" : "Modo oscuro"}
        onClick={toggleTheme}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <section className="panel w-full max-w-md p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-white dark:bg-mint dark:text-ink">
            <PiggyBank size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink dark:text-white">Finanzas personales</h1>
            <p className="text-sm text-slate-500">Control diario, quincenal y mensual.</p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {["login", "register"].map((item) => (
            <button key={item} type="button" className={`rounded-md px-3 py-2 text-sm font-semibold ${mode === item ? "bg-white text-ink shadow-sm dark:bg-slate-950 dark:text-white" : "text-slate-500"}`} onClick={() => setMode(item)}>
              {item === "login" ? "Entrar" : "Registro"}
            </button>
          ))}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="label">Email</label>
            <input className="field" type="email" {...formRegister("email")} />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <label className="label">Contrasena</label>
            <input className="field" type="password" {...formRegister("password")} />
            <FieldError message={errors.password?.message} />
          </div>
          {mode === "register" ? (
            <div>
              <label className="label">Moneda</label>
              <input className="field" {...formRegister("currency")} />
            </div>
          ) : null}
          {serverError ? <p className="rounded-md bg-rose-50 p-3 text-sm font-medium text-rose-700">{serverError}</p> : null}
          <button className="btn-primary w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoadingSpinner label="Procesando..." className="text-current" />
                Procesando...
              </>
            ) : mode === "login" ? (
              "Entrar"
            ) : (
              "Crear cuenta"
            )}
          </button>
        </form>
      </section>
    </main>
  );
};
