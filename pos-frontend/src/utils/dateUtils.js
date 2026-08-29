import { useSelector } from "react-redux";

/**
 * Format a date string or Date object according to the store's configured date format.
 * Supported patterns: "MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD", "DD-MM-YYYY"
 */
export const formatDateByPattern = (dateInput, pattern = "DD/MM/YYYY") => {
  if (!dateInput) return "—";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  switch (pattern?.toUpperCase()) {
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
 * Format date & time with standard 12-hour AM/PM format.
 */
export const formatDateTime = (dateInput) => {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Format time only (12-hour format).
 */
export const formatTime = (dateInput) => {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Human-readable relative time ("Just now", "5 minutes ago", "Yesterday", etc.)
 */
export const getRelativeTime = (dateInput) => {
  if (!dateInput) return "—";
  const now = new Date();
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateByPattern(dateInput, "DD/MM/YYYY");
};

/**
 * Custom hook to format dates using the current store's configured Date Format setting from Redux.
 */
export const useDateFormatter = () => {
  const store = useSelector((state) => state.store?.store);
  const dateFormat = store?.dateFormat || "DD/MM/YYYY";

  const format = (dateInput, overridePattern) => {
    return formatDateByPattern(dateInput, overridePattern || dateFormat);
  };

  return { format, dateFormat, formatDateTime, formatTime, getRelativeTime };
};
