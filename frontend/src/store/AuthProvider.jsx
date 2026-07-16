import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { endpoints, setAccessToken } from "../services/api.js";

const AuthContext = createContext(null);
const STORAGE_KEY = "finance-auth";

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    setAccessToken(session?.accessToken);
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  }, [session]);

  const value = useMemo(
    () => ({
      user: session?.user || null,
      token: session?.accessToken || null,
      isAuthenticated: Boolean(session?.accessToken),
      login: async (payload) => {
        const response = await endpoints.auth.login(payload);
        setSession(response.data);
      },
      register: async (payload) => {
        const response = await endpoints.auth.register(payload);
        setSession(response.data);
      },
      logout: () => setSession(null)
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

