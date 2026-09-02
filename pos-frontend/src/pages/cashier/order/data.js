import { formatDateTimeByPattern } from "@/utils/dateUtils";

export const getStatusBadgeVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'success':
      return 'active';
    case 'pending':
      return 'warning';
    case 'cancelled':
    case 'failed':
    case 'refunded':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'success':
      return '#262422';
    case 'pending':
      return '#C9A227';
    case 'cancelled':
    case 'failed':
    case 'refunded':
      return '#A6543A';
    default:
      return '#78716C';
  }
};

export const formatDate = (date) => {
  return formatDateTimeByPattern(date, 'DD/MM/YYYY');
};

export const getPaymentModeLabel = (mode) => {
  switch (mode?.toUpperCase()) {
    case 'CASH':
      return 'Cash';
    case 'CARD':
      return 'Card';
    case 'UPI':
      return 'UPI';
    default:
      return mode || 'Cash';
  }
};