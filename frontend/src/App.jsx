import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout.jsx";
import { FullPageLoader, GlobalRequestLoader } from "./components/LoadStates.jsx";
import { Toaster } from "./components/Toaster.jsx";
import { useAuth } from "./store/AuthProvider.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { TransactionsPage } from "./pages/TransactionsPage.jsx";
import { CategoriesPage } from "./pages/CategoriesPage.jsx";
import { BudgetsPage } from "./pages/BudgetsPage.jsx";
import { SavingsPage } from "./pages/SavingsPage.jsx";
import { HistoryPage } from "./pages/HistoryPage.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) return <FullPageLoader label="Preparando tu sesion..." />;

  return isAuthenticated ? children : <Navigate to="/login" replace state={{ from: location }} />;
};

export const App = () => (
  <>
    <GlobalRequestLoader />
    <Toaster />
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="transacciones" element={<TransactionsPage />} />
        <Route path="categorias" element={<CategoriesPage />} />
        <Route path="presupuestos" element={<BudgetsPage />} />
        <Route path="ahorro" element={<SavingsPage />} />
        <Route path="historico" element={<HistoryPage />} />
        <Route path="configuracion" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
);
