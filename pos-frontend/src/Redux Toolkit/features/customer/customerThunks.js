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

// 🔹 Create Customer
export const createCustomer = createAsyncThunk(
  'customer/create',
  async (customer, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.post('/api/customers', customer, { headers });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create customer');
    }
  }
);

// 🔹 Update Customer
export const updateCustomer = createAsyncThunk(
  'customer/update',
  async ({ id, customer }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.put(`/api/customers/${id}`, customer, { headers });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update customer');
    }
  }
);

// 🔹 Delete Customer
export const deleteCustomer = createAsyncThunk(
  'customer/delete',
  async (id, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      await api.delete(`/api/customers/${id}`, { headers });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete customer');
    }
  }
);

// 🔹 Get Customer by ID
export const getCustomerById = createAsyncThunk(
  'customer/getById',
  async (id, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/customers/${id}`, { headers });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Customer not found');
    }
  }
);

// 🔹 Get All Customers
export const getAllCustomers = createAsyncThunk(
  'customer/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get('/api/customers', { headers });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

// 🔹 Add Loyalty Points
export const addLoyaltyPoints = createAsyncThunk(
  'customer/addPoints',
  async ({ id, points }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.post(`/api/customers/${id}/points?points=${points}`, {}, { headers });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add loyalty points');
    }
  }
);

// 🔹 Get Customer Overview
export const getCustomerOverview = createAsyncThunk(
  'customer/getOverview',
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get('/api/customers/overview', { headers });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch customer overview');
    }
  }
);
 