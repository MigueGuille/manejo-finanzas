import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { endpoints, setAccessToken } from "../services/api.js";

const AuthContext = createContext(null);
const STORAGE_KEY = "finance-auth";

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const nextSession = stored ? JSON.parse(stored) : null;
      setAccessToken(nextSession?.accessToken);
      return nextSession?.accessToken ? nextSession : null;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setAccessToken(session?.accessToken);
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
    setIsReady(true);
  }, [session]);

  useEffect(() => {
    const handleExpiredSession = () => setSession(null);
    window.addEventListener("finance-auth-expired", handleExpiredSession);
    return () => window.removeEventListener("finance-auth-expired", handleExpiredSession);
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user || null,
      token: session?.accessToken || null,
      isReady,
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
    [isReady, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
