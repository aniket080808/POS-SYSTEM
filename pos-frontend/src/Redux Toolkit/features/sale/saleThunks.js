import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/utils/api';

// 🔹 Create Sale
export const createSale = createAsyncThunk('sale/create', async ({ saleData, token }, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/sales', saleData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create sale');
  }
});

// 🔹 Get Sale by ID
export const getSaleById = createAsyncThunk('sale/getById', async ({ saleId, token }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/api/sales/${saleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to get sale');
  }
});

// 🔹 Get All Sales
export const getAllSales = createAsyncThunk('sale/getAll', async ({ storeId, token }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/api/sales?storeId=${storeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to get sales');
  }
});

// 🔹 Get Sales by Date Range
export const getSalesByDateRange = createAsyncThunk('sale/getByDateRange', async ({ storeId, startDate, endDate, token }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/api/sales/date-range?storeId=${storeId}&startDate=${startDate}&endDate=${endDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to get sales by date range');
  }
});

// 🔹 Get Sales by Branch
export const getSalesByBranch = createAsyncThunk('sale/getByBranch', async ({ branchId, token }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/api/sales/branch/${branchId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to get sales by branch');
  }
});

// 🔹 Get Sales by Employee
export const getSalesByEmployee = createAsyncThunk('sale/getByEmployee', async ({ employeeId, token }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/api/sales/employee/${employeeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to get sales by employee');
  }
});

// 🔹 Get Sales by Payment Method
export const getSalesByPaymentMethod = createAsyncThunk('sale/getByPaymentMethod', async ({ storeId, paymentMethod, token }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/api/sales/payment-method?storeId=${storeId}&method=${paymentMethod}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to get sales by payment method');
  }
});