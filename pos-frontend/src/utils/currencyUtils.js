import { useSelector } from 'react-redux';

/**
 * Maps currency codes to their display symbols.
 */
export const getCurrencySymbol = (currencyCode = 'INR') => {
  switch (currencyCode?.toUpperCase()) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'CAD':
      return 'C$';
    case 'AUD':
      return 'A$';
    case 'INR':
    default:
      return '₹';
  }
};

/**
 * Formats a numeric amount according to currency code.
 */
export const formatCurrency = (amount, currencyCode = 'INR') => {
  const numericAmount = Number(amount) || 0;
  const curr = (currencyCode || 'INR').toUpperCase();
  
  // Custom format locale based on currency
  let locale = 'en-IN';
  if (curr === 'USD' || curr === 'CAD' || curr === 'AUD') locale = 'en-US';
  else if (curr === 'EUR') locale = 'de-DE';
  else if (curr === 'GBP') locale = 'en-GB';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch (e) {
    return `${getCurrencySymbol(curr)}${numericAmount.toFixed(2)}`;
  }
};

/**
 * Custom React hook returning store-aware currency formatter and symbol.
 * Includes multiple fallbacks for branch and cashier users.
 */
export const useCurrencyFormatter = () => {
  const store = useSelector((state) => state.store?.store);
  const userProfile = useSelector((state) => state.user?.userProfile);
  const branch = useSelector((state) => state.branch?.branch);

  const currency =
    store?.currency ||
    branch?.store?.currency ||
    userProfile?.store?.currency ||
    userProfile?.branch?.store?.currency ||
    'INR';
  const symbol = getCurrencySymbol(currency);

  const format = (amount) => formatCurrency(amount, currency);

  return { format, currency, symbol };
};
