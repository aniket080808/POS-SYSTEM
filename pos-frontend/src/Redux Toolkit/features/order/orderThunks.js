import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/utils/api';

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

// 🔹 Create Order
export const createOrder = createAsyncThunk(
  'order/create',
  async (dto, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.post('/api/orders', dto, { headers });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create order');
    }
  }
);

// 🔹 Get Order by ID
export const getOrderById = createAsyncThunk(
  'order/getById',
  async (id, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/orders/${id}`, { headers });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Order not found');
    }
  }
);

// 🔹 Get Orders by Branch (with optional filters)
export const getOrdersByBranch = createAsyncThunk(
  'order/getByBranch',
  async ({ branchId, customerId, cashierId, paymentType, status }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const params = [];
      if (customerId) params.push(`customerId=${customerId}`);
      if (cashierId) params.push(`cashierId=${cashierId}`);
      if (paymentType) params.push(`paymentType=${paymentType}`);
      if (status) params.push(`status=${status}`);
      const query = params.length ? `?${params.join('&')}` : '';
      const res = await api.get(`/api/orders/branch/${branchId}${query}`, { headers });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

// 🔹 Get Orders by Cashier
export const getOrdersByCashier = createAsyncThunk(
  'order/getByCashier',
  async (cashierId, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/orders/cashier/${cashierId}`, { headers });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

// 🔹 Get Today's Orders by Branch
export const getTodayOrdersByBranch = createAsyncThunk(
  'order/getTodayByBranch',
  async (branchId, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/orders/today/branch/${branchId}`, { headers });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch today\'s orders');
    }
  }
);

// 🔹 Delete Order
export const deleteOrder = createAsyncThunk(
  'order/delete',
  async (id, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      await api.delete(`/api/orders/${id}`, { headers });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete order');
    }
  }
);

// 🔹 Get Orders by Customer
export const getOrdersByCustomer = createAsyncThunk(
  'order/getByCustomer',
  async (customerId, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/orders/customer/${customerId}`, { headers });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch customer orders');
    }
  }
);

// 🔹 Get Top 5 Recent Orders by Branch
export const getRecentOrdersByBranch = createAsyncThunk(
  'order/getRecentByBranch',
  async (branchId, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/orders/recent/${branchId}`, { headers });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch recent orders');
    }
  }
);

// 🔹 Get Paginated Orders for Store
export const getPaginatedOrders = createAsyncThunk(
  'order/getPaginated',
  async (payload, { rejectWithValue }) => {
    try {
      const storeAdminId = payload?.storeAdminId || payload?.storeId || (typeof payload === 'number' || typeof payload === 'string' ? payload : null);
      if (!storeAdminId) {
        return rejectWithValue('Store Admin ID is required');
      }
      const page = payload?.page ?? 0;
      const size = payload?.size ?? 10;
      const headers = getAuthHeaders();
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', size);
      if (payload.branchId && payload.branchId !== 'ALL') params.append('branchId', payload.branchId);
      if (payload.paymentType && payload.paymentType !== 'ALL') params.append('paymentType', payload.paymentType);
      if (payload.status && payload.status !== 'ALL') params.append('status', payload.status);
      if (payload.startDate) params.append('startDate', payload.startDate);
      if (payload.endDate) params.append('endDate', payload.endDate);

      const res = await api.get(`/api/orders/store/${storeAdminId}/paginated?${params.toString()}`, { headers });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch paginated orders');
    }
  }
);
