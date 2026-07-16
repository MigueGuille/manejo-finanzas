import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" }
});

export const setAccessToken = (token) => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || "Error de red";
    return Promise.reject(new Error(message));
  }
);

export const endpoints = {
  auth: {
    register: (payload) => api.post("/auth/register", payload),
    login: (payload) => api.post("/auth/login", payload)
  },
  categories: {
    list: () => api.get("/categories"),
    create: (payload) => api.post("/categories", payload),
    update: (id, payload) => api.put(`/categories/${id}`, payload),
    remove: (id) => api.delete(`/categories/${id}`)
  },
  transactions: {
    list: (params) => api.get("/transactions", { params }),
    create: (payload) => api.post("/transactions", payload),
    update: (id, payload) => api.put(`/transactions/${id}`, payload),
    remove: (id) => api.delete(`/transactions/${id}`)
  },
  recurring: {
    list: () => api.get("/recurring-transactions"),
    create: (payload) => api.post("/recurring-transactions", payload)
  },
  budgets: {
    list: () => api.get("/budgets"),
    create: (payload) => api.post("/budgets", payload)
  },
  savings: {
    list: () => api.get("/savings-goals"),
    create: (payload) => api.post("/savings-goals", payload),
    contribute: (id, payload) => api.post(`/savings-goals/${id}/contributions`, payload)
  },
  dashboard: {
    summary: (params) => api.get("/dashboard/summary", { params }),
    history: (params) => api.get("/dashboard/history", { params })
  },
  user: {
    settings: () => api.get("/user/settings"),
    updateSettings: (payload) => api.put("/user/settings", payload)
  },
  reports: {
    export: (format = "csv") => api.get("/reports/export", { params: { format }, responseType: "blob" })
  }
};
