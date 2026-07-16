import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfDay,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
  startOfMonth,
  subDays
} from "date-fns";

export const toDateOnly = (value) => startOfDay(typeof value === "string" ? parseISO(value) : value);
export const toISODate = (value) => format(value, "yyyy-MM-dd");

export const getActivePeriod = (periodType = "monthly", date = new Date(), biweeklyConfig = null) => {
  const current = toDateOnly(date);

  if (periodType === "daily") {
    return { start: current, end: endOfDay(current) };
  }

  if (periodType === "biweekly") {
    const firstCut = Number(biweeklyConfig?.firstCut || biweeklyConfig?.first_cut || 15);
    const day = current.getDate();
    const firstStart = startOfMonth(current);
    const firstEnd = new Date(current.getFullYear(), current.getMonth(), firstCut);

    if (day <= firstCut) {
      return { start: firstStart, end: endOfDay(firstEnd) };
    }

    return { start: addDays(firstEnd, 1), end: endOfDay(endOfMonth(current)) };
  }

  return { start: startOfMonth(current), end: endOfDay(endOfMonth(current)) };
};

export const previousPeriod = (periodType, periodStart, biweeklyConfig = null) => {
  const anchor = subDays(toDateOnly(periodStart), 1);
  return getActivePeriod(periodType, anchor, biweeklyConfig);
};

export const addFrequency = (date, frequency) => {
  const current = toDateOnly(date);
  const map = {
    daily: addDays(current, 1),
    weekly: addWeeks(current, 1),
    biweekly: addWeeks(current, 2),
    monthly: addMonths(current, 1),
    yearly: addYears(current, 1)
  };
  return map[frequency] || addMonths(current, 1);
};

export const hasDatePassed = (date, now = new Date()) => isBefore(toDateOnly(date), toDateOnly(now));
export const isDue = (date, now = new Date()) => isSameDay(toDateOnly(date), toDateOnly(now)) || isBefore(toDateOnly(date), toDateOnly(now));
export const rangeWhere = (from, to) => ({
  ...(from ? { gte: toDateOnly(from) } : {}),
  ...(to ? { lte: endOfDay(toDateOnly(to)) } : {})
});

export const dateIsAfter = (date, compare) => isAfter(toDateOnly(date), toDateOnly(compare));

