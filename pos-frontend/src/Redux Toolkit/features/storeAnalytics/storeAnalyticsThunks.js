import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utils/api";

// Helper function to get JWT token
const getAuthToken = () => {
  const token = localStorage.getItem('jwt');
  if (!token) {
    throw new Error('No JWT token found');
  }
  return token;
};

// Helper function to set auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const extractId = (arg) => {
  if (arg === null || arg === undefined) return '';
  if (typeof arg === 'number' || typeof arg === 'string') return arg;
  return arg.storeAdminId || arg.id || arg.storeId || '';
};

// 🔹 Get Store Overview (KPI Summary)
export const getStoreOverview = createAsyncThunk(
  "storeAnalytics/getStoreOverview",
  async (payload, { rejectWithValue }) => {
    try {
      const storeAdminId = extractId(payload);
      console.log('🔄 Fetching store overview...', { storeAdminId });
      
      const headers = getAuthHeaders();
      const res = await api.get(`/api/store/analytics/${storeAdminId}/overview`, { headers });
      
      console.log('✅ Store overview fetched successfully:', {
        storeAdminId,
        response: res.data
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to fetch store overview:', {
        storeAdminId: extractId(payload),
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch store overview"
      );
    }
  }
);

// 🔹 Get Sales Trends by Time (daily/weekly/monthly)
export const getSalesTrends = createAsyncThunk(
  "storeAnalytics/getSalesTrends",
  async (payload, { rejectWithValue }) => {
    try {
      const storeAdminId = extractId(payload);
      const period = payload?.period || 'daily';
      console.log('🔄 Fetching sales trends...', { storeAdminId, period });
      
      const headers = getAuthHeaders();
      const res = await api.get(`/api/store/analytics/${storeAdminId}/sales-trends?period=${period}`, { headers });
      
      console.log('✅ Sales trends fetched successfully:', {
        storeAdminId,
        period,
        response: res.data
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to fetch sales trends:', {
        storeAdminId: extractId(payload),
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch sales trends"
      );
    }
  }
);

// 🔹 Get Monthly Sales Chart (line)
export const getMonthlySales = createAsyncThunk(
  "storeAnalytics/getMonthlySales",
  async (payload, { rejectWithValue }) => {
    try {
      const storeAdminId = extractId(payload);
      console.log('🔄 Fetching monthly sales...', { storeAdminId });
      
      const headers = getAuthHeaders();
      const res = await api.get(`/api/store/analytics/${storeAdminId}/sales/monthly`, { headers });
      
      console.log('✅ Monthly sales fetched successfully:', {
        storeAdminId,
        dataPoints: res.data?.length,
        response: res.data
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to fetch monthly sales:', {
        storeAdminId: extractId(payload),
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch monthly sales"
      );
    }
  }
);

// 🔹 Get Daily Sales Chart (line)
export const getDailySales = createAsyncThunk(
  "storeAnalytics/getDailySales",
  async (payload, { rejectWithValue }) => {
    try {
      const storeAdminId = extractId(payload);
      console.log('🔄 Fetching daily sales...', { storeAdminId });
      
      const headers = getAuthHeaders();
      const res = await api.get(`/api/store/analytics/${storeAdminId}/sales/daily`, { headers });
      
      console.log('✅ Daily sales fetched successfully:', {
        storeAdminId,
        dataPoints: res.data?.length,
        response: res.data
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to fetch daily sales:', {
        storeAdminId: extractId(payload),
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch daily sales"
      );
    }
  }
);

// 🔹 Get Sales by Product Category (pie/bar)
export const getSalesByCategory = createAsyncThunk(
  "storeAnalytics/getSalesByCategory",
  async (payload, { rejectWithValue }) => {
    try {
      const storeAdminId = extractId(payload);
      console.log('🔄 Fetching sales by category...', { storeAdminId });
      
      const headers = getAuthHeaders();
      const res = await api.get(`/api/store/analytics/${storeAdminId}/sales/category`, { headers });
      
      console.log('✅ Sales by category fetched successfully:', {
        storeAdminId,
        categories: res.data?.length,
        response: res.data
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to fetch sales by category:', {
        storeAdminId: extractId(payload),
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch sales by category"
      );
    }
  }
);

// 🔹 Get Sales by Payment Method (pie)
export const getSalesByPaymentMethod = createAsyncThunk(
  "storeAnalytics/getSalesByPaymentMethod",
  async (payload, { rejectWithValue }) => {
    try {
      const storeAdminId = extractId(payload);
      console.log('🔄 Fetching sales by payment method...', { storeAdminId });
      
      const headers = getAuthHeaders();
      const res = await api.get(`/api/store/analytics/${storeAdminId}/sales/payment-method`, { headers });
      
      console.log('✅ Sales by payment method fetched successfully:', {
        storeAdminId,
        paymentMethods: res.data?.length,
        response: res.data
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to fetch sales by payment method:', {
        storeAdminId: extractId(payload),
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch sales by payment method"
      );
    }
  }
);

// 🔹 Get Sales by Branch (bar)
export const getSalesByBranch = createAsyncThunk(
  "storeAnalytics/getSalesByBranch",
  async (payload, { rejectWithValue }) => {
    try {
      const storeAdminId = extractId(payload);
      console.log('🔄 Fetching sales by branch...', { storeAdminId });
      
      const headers = getAuthHeaders();
      const res = await api.get(`/api/store/analytics/${storeAdminId}/sales/branch`, { headers });
      
      console.log('✅ Sales by branch fetched successfully:', {
        storeAdminId,
        branches: res.data?.length,
        response: res.data
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to fetch sales by branch:', {
        storeAdminId: extractId(payload),
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch sales by branch"
      );
    }
  }
);

// 🔹 Get Payment Breakdown (Cash, UPI, Card)
export const getPaymentBreakdown = createAsyncThunk(
  "storeAnalytics/getPaymentBreakdown",
  async (payload, { rejectWithValue }) => {
    try {
      const storeAdminId = extractId(payload);
      console.log('🔄 Fetching payment breakdown...', { storeAdminId });
      
      const headers = getAuthHeaders();
      const res = await api.get(`/api/store/analytics/${storeAdminId}/payments`, { headers });
      
      console.log('✅ Payment breakdown fetched successfully:', {
        storeAdminId,
        paymentTypes: res.data?.length,
        response: res.data
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to fetch payment breakdown:', {
        storeAdminId: extractId(payload),
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch payment breakdown"
      );
    }
  }
);

// 🔹 Get Branch Performance
export const getBranchPerformance = createAsyncThunk(
  "storeAnalytics/getBranchPerformance",
  async (payload, { rejectWithValue }) => {
    try {
      const storeAdminId = extractId(payload);
      console.log('🔄 Fetching branch performance...', { storeAdminId });
      
      const headers = getAuthHeaders();
      const res = await api.get(`/api/store/analytics/${storeAdminId}/branch-performance`, { headers });
      
      console.log('✅ Branch performance fetched successfully:', {
        storeAdminId,
        response: res.data
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to fetch branch performance:', {
        storeAdminId: extractId(payload),
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch branch performance"
      );
    }
  }
);

// 🔹 Get Recent Sales (for dashboard card)
export const getRecentSales = createAsyncThunk(
  "storeAnalytics/getRecentSales",
  async (payload, { rejectWithValue }) => {
    try {
      const storeAdminId = extractId(payload);
      const headers = getAuthHeaders();
      const res = await api.get(`/api/store/analytics/${storeAdminId}/sales/recent?limit=5`, { headers });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch recent sales"
      );
    }
  }
);

// 🔹 Get Store Alerts and Health Monitoring
export const getStoreAlerts = createAsyncThunk(
  "storeAnalytics/getStoreAlerts",
  async (payload, { rejectWithValue }) => {
    try {
      const storeAdminId = extractId(payload);
      console.log('🔄 Fetching store alerts...', { storeAdminId });
      
      const headers = getAuthHeaders();
      const res = await api.get(`/api/store/analytics/${storeAdminId}/alerts`, { headers });
      
      console.log('✅ Store alerts fetched successfully:', {
        storeAdminId,
        response: res.data
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to fetch store alerts:', {
        storeAdminId: extractId(payload),
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch store alerts"
      );
    }
  }
);

// 🔹 Dismiss Store Alert
export const dismissAlert = createAsyncThunk(
  "storeAnalytics/dismissAlert",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const storeAdminId = extractId(payload);
      const { alertType, referenceId, snapshotValue } = payload || {};
      const headers = getAuthHeaders();
      const res = await api.post(`/api/store/analytics/${storeAdminId}/alerts/dismiss`, {
        alertType,
        referenceId: String(referenceId),
        snapshotValue: snapshotValue !== undefined ? String(snapshotValue) : null
      }, { headers });
      
      dispatch(getStoreAlerts(storeAdminId));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to dismiss alert");
    }
  }
);

// 🔹 Super Admin: Get Store Usage for a specific store
export const getStoreUsageForAdmin = createAsyncThunk(
  "storeAnalytics/getStoreUsageForAdmin",
  async (payload, { rejectWithValue }) => {
    try {
      const storeId = extractId(payload);
      console.log('🔄 Fetching store usage for admin...', { storeId });
      
      const headers = getAuthHeaders();
      const res = await api.get(`/api/super-admin/stores/${storeId}/usage`, { headers });
      
      console.log('✅ Store usage fetched successfully:', {
        storeId,
        response: res.data
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to fetch store usage:', {
        storeId: extractId(payload),
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch store usage"
      );
    }
  }
);
