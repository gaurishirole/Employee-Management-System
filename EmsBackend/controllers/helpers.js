import { startOfDay, endOfDay } from "date-fns";

export const getIndiaDayRange = (date = new Date()) => {
  const istOffset = 5.5 * 60;
  const local = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  const ist = new Date(local.getTime() + istOffset * 60000);
  return { start: startOfDay(ist), end: endOfDay(ist) };
};

export const parseDateDMY = (dateStr) => {
  if (!dateStr) return undefined;
  if (dateStr instanceof Date) return dateStr;
  if (typeof dateStr !== "string") return dateStr;

  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return dateStr;
};

export const isValidId = (val) => {
  if (!val) return false;
  if (val === "abc") return false;
  return !isNaN(Number(val));
};
