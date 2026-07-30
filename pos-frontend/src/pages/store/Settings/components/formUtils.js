// Transform settings data to API format
export const transformSettingsToApiFormat = (settings) => {
  return {
    brand: settings.storeName,
    description: settings.storeDescription,
    storeType: "Retail Store", // Default value since we don't have this in settings
    contact: {
      address: settings.storeAddress,
      phone: settings.storePhone,
      email: settings.storeEmail,
    },
    // Additional fields that might be needed by the API
    currency: settings.currency,
    taxRate: parseFloat(settings.taxRate) || 0,
    timezone: settings.timezone,
    dateFormat: settings.dateFormat,
    receiptFooter: settings.receiptFooter,
    acceptedPaymentMethods: settings.acceptedPaymentMethods,
  };
};

// Transform API data to settings format
export const transformApiToSettingsFormat = (apiData) => {
  return {
    storeName: apiData.brand || "",
    storeEmail: apiData.contact?.email || "",
    storePhone: apiData.contact?.phone || "",
    storeAddress: apiData.contact?.address || "",
    storeDescription: apiData.description || "",
    currency: apiData.currency || "INR",
    taxRate: apiData.taxRate?.toString() || "0",
    timezone: apiData.timezone || "Asia/Kolkata",
    dateFormat: apiData.dateFormat || "MM/DD/YYYY",
    receiptFooter: apiData.receiptFooter || "",
    acceptedPaymentMethods: apiData.acceptedPaymentMethods || "cash,upi,card",
  };
};

// Get initial values for the form
export const getInitialValues = (storeData) => {
  if (!storeData) {
    return {
      storeName: "",
      storeEmail: "",
      storePhone: "",
      storeAddress: "",
      storeDescription: "",
      currency: "INR",
      taxRate: "0",
      timezone: "Asia/Kolkata",
      dateFormat: "MM/DD/YYYY",
      receiptFooter: "",
    };
  }

  return transformApiToSettingsFormat(storeData);
};