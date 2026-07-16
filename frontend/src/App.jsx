import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout.jsx";
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
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export const App = () => (
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
  </Routes>
);

