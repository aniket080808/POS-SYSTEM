import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/utils/api';

// 🔹 Get user profile from JWT
export const getUserProfile = createAsyncThunk('user/getProfile', async (token, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
  }
});

// 🔹 Get all customers
export const getCustomers = createAsyncThunk('user/getCustomers', async (token, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/users/customer', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch customers');
  }
});

// 🔹 Get all cashiers
export const getCashiers = createAsyncThunk('user/getCashiers', async (token, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/users/cashier', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch cashiers');
  }
});

// 🔹 Get all users
export const getAllUsers = createAsyncThunk('user/getAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/users/list');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
  }
});

// 🔹 Get user by ID
export const getUserById = createAsyncThunk('user/getById', async (userId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/users/${userId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'User not found');
  }
});

// 🔹 Logout user
export const logout = createAsyncThunk('user/logout', async (_, { rejectWithValue }) => {
  try {
    localStorage.removeItem('jwt');
    // Optionally, clear other relevant local storage items or session data
    return 'Logged out successfully';
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to logout');
  }
});
