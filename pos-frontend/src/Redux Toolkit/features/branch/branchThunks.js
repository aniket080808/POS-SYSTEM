import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/utils/api';

// 🔹 Create Branch
export const createBranch = createAsyncThunk('branch/create', async (payload, { rejectWithValue }) => {
  try {
    const dto = payload?.dto || payload?.branchData || payload;
    const token = payload?.jwt || localStorage.getItem('jwt');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await api.post('/api/branches', dto, { headers });
    console.log('Create branch success:', res.data);
    return res.data;
  } catch (err) {
    console.error('Create branch error:', err);
    return rejectWithValue(err.response?.data?.message || err.message || 'Create branch failed');
  }
});

// 🔹 Get Branch by ID
export const getBranchById = createAsyncThunk('branch/getById', async (payload, { rejectWithValue }) => {
  try {
    const id = typeof payload === 'object' ? payload.id : payload;
    const token = payload?.jwt || localStorage.getItem('jwt');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await api.get(`/api/branches/${id}`, { headers });
    console.log('Get branch by ID success:', res.data);
    return res.data;
  } catch (err) {
    console.error('Get branch by ID error:', err);
    return rejectWithValue(err.response?.data?.message || err.message || 'Branch not found');
  }
});

// 🔹 Get All Branches by Store
export const getAllBranchesByStore = createAsyncThunk('branch/getAllByStore', async (payload, { rejectWithValue }) => {
  try {
    const storeId = typeof payload === 'object' ? payload.storeId : payload;
    const token = payload?.jwt || localStorage.getItem('jwt');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await api.get(`/api/branches/store/${storeId}`, { headers });
    console.log('Get all branches by store success:', res.data);
    return res.data;
  } catch (err) {
    console.error('Get all branches by store error:', err);
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch branches');
  }
});

// 🔹 Update Branch
export const updateBranch = createAsyncThunk('branch/update', async (payload, { rejectWithValue }) => {
  try {
    const id = payload?.id;
    const dto = payload?.dto || payload?.branchData || payload;
    const token = payload?.jwt || localStorage.getItem('jwt');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await api.put(`/api/branches/${id}`, dto, { headers });
    return res.data;
  } catch (err) {
    console.error('Update branch error:', err);
    return rejectWithValue(err.response?.data?.message || err.message || 'Update failed');
  }
});

// 🔹 Delete Branch
export const deleteBranch = createAsyncThunk('branch/delete', async (payload, { rejectWithValue }) => {
  try {
    const id = typeof payload === 'object' ? payload.id : payload;
    const token = payload?.jwt || localStorage.getItem('jwt');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    await api.delete(`/api/branches/${id}`, { headers });
    return id;
  } catch (err) {
    console.error('Delete branch error:', err);
    return rejectWithValue(err.response?.data?.message || err.message || 'Delete failed');
  }
});

