import { useSelector } from "react-redux";

/**
 * Format a date string or Date object according to the store's configured date format.
 * Supported patterns: "MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD", "DD-MM-YYYY"
 */
export const formatDateByPattern = (dateInput, pattern = "MM/DD/YYYY") => {
  if (!dateInput) return "";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  switch (pattern?.toUpperCase()) {
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "DD-MM-YYYY":
      return `${day}-${month}-${year}`;
    case "MM/DD/YYYY":
    default:
      return `${month}/${day}/${year}`;
  }
};

/**
 * Custom hook to format dates using the current store's configured Date Format setting from Redux.
 */
export const useDateFormatter = () => {
  const store = useSelector((state) => state.store?.store);
  const dateFormat = store?.dateFormat || "MM/DD/YYYY";

  const format = (dateInput, overridePattern) => {
    return formatDateByPattern(dateInput, overridePattern || dateFormat);
  };

  return { format, dateFormat };
};
