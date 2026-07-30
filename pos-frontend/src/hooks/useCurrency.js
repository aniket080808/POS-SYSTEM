import { useSelector } from "react-redux";

export const CURRENCY_SYMBOLS = {
  INR: "₹",
};

export const CURRENCY_LOCALES = {
  INR: "en-IN",
};

export const useCurrency = () => {
  const { store } = useSelector((state) => state.store);
  const currencyCode = store?.currency || "INR";
  const symbol = CURRENCY_SYMBOLS[currencyCode] || "₹";
  const locale = CURRENCY_LOCALES[currencyCode] || "en-IN";

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatCurrencySimple = (amount) => {
    return `${symbol}${Number(amount).toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  return {
    currencyCode,
    symbol,
    locale,
    formatCurrency,
    formatCurrencySimple,
  };
};

export default useCurrency;