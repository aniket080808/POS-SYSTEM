import { useSelector } from "react-redux";

/**
 * Format a date string or Date object according to a given pattern.
 * Supported patterns: "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD-MM-YYYY"
 * Default: "DD/MM/YYYY"
 */
export const formatDateByPattern = (dateInput, pattern = "DD/MM/YYYY") => {
  if (!dateInput) return "";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const activePattern = (pattern || "DD/MM/YYYY").toUpperCase();

  switch (activePattern) {
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "DD-MM-YYYY":
      return `${day}-${month}-${year}`;
    case "DD/MM/YYYY":
    default:
      return `${day}/${month}/${year}`;
  }
};

/**
 * Format date and time according to store date format pattern
 */
export const formatDateTimeByPattern = (dateInput, pattern = "DD/MM/YYYY", options = {}) => {
  if (!dateInput) return "";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const formattedDate = formatDateByPattern(dateInput, pattern);
  const timeStr = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: options.hour12 !== false,
  });

  return `${formattedDate}, ${timeStr}`;
};

/**
 * Custom hook to format dates using the current store's configured Date Format setting from Redux.
 */
export const useDateFormatter = () => {
  const store = useSelector((state) => state.store?.store);
  const dateFormat = store?.dateFormat || "DD/MM/YYYY";

  const formatDate = (dateInput, overridePattern) => {
    return formatDateByPattern(dateInput, overridePattern || dateFormat);
  };

  const formatDateTime = (dateInput, overridePattern, options) => {
    return formatDateTimeByPattern(dateInput, overridePattern || dateFormat, options);
  };

  return { format: formatDate, formatDate, formatDateTime, dateFormat };
};
