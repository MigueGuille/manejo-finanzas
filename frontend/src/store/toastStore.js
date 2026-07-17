const toastListeners = new Set();
let toasts = [];

const notifyListeners = () => {
  toastListeners.forEach((listener) => listener());
};

export const subscribeToasts = (listener) => {
  toastListeners.add(listener);
  return () => toastListeners.delete(listener);
};

export const getToasts = () => toasts;

export const dismissToast = (id) => {
  toasts = toasts.filter((toast) => toast.id !== id);
  notifyListeners();
};

export const pushToast = ({ type = "success", title, message, duration = 4200 }) => {
  const id = crypto.randomUUID();
  toasts = [...toasts, { id, type, title, message }];
  notifyListeners();

  window.setTimeout(() => dismissToast(id), duration);
  return id;
};

export const toast = {
  success: (title, message) => pushToast({ type: "success", title, message }),
  error: (title, message) => pushToast({ type: "error", title, message })
};
