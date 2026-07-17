import axios from "axios";
import { toast } from "../store/toastStore.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
let activeRequestCount = 0;
const requestActivityListeners = new Set();

const notifyRequestActivity = () => {
  requestActivityListeners.forEach((listener) => listener());
};

const incrementActiveRequests = () => {
  activeRequestCount += 1;
  notifyRequestActivity();
};

const decrementActiveRequests = () => {
  activeRequestCount = Math.max(0, activeRequestCount - 1);
  notifyRequestActivity();
};

export const subscribeRequestActivity = (listener) => {
  requestActivityListeners.add(listener);
  return () => requestActivityListeners.delete(listener);
};

export const getActiveRequestCount = () => activeRequestCount;

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" }
});

export const setAccessToken = (token) => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

api.interceptors.request.use(
  (config) => {
    incrementActiveRequests();
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    decrementActiveRequests();
    return response.data;
  },
  (error) => {
    decrementActiveRequests();
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event("finance-auth-expired"));
    }
    const message = error.response?.data?.message || error.message || "Error de red";
    toast.error("No se pudo completar la accion", message);
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
    create: (payload) => api.post("/budgets", payload),
    update: (id, payload) => api.put(`/budgets/${id}`, payload),
    remove: (id) => api.delete(`/budgets/${id}`)
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
