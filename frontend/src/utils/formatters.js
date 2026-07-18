const validCurrency = (currency) => {
  try {
    new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(0);
    return true;
  } catch {
    return false;
  }
};

export const normalizeCurrency = (currency = "USD") => (currency === "BS" ? "VES" : currency);

export const currencyLabel = (currency = "USD") => {
  const normalized = normalizeCurrency(currency);
  return normalized === "VES" ? "Bs" : normalized;
};

export const money = (value = 0, currency = "MXN") => {
  const amount = Number(value || 0);
  const normalizedCurrency = normalizeCurrency(currency);

  if (normalizedCurrency === "VES") {
    return `Bs ${formatDecimal(amount)}`;
  }

  if (!validCurrency(normalizedCurrency)) {
    return `${formatDecimal(amount)} ${currency || ""}`.trim();
  }

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: normalizedCurrency,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDecimal = (value = 0) =>
  new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value || 0));

export const parseDecimalInput = (value = "") => {
  const digits = String(value).replace(/\D/g, "");
  return Number(digits || 0) / 100;
};

export const percent = (value = 0) => `${Number(value || 0).toFixed(1)}%`;

export const today = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
