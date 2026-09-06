import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/utils/api';

// 🔹 Create inventory
export const createInventory = createAsyncThunk(
  'inventory/create',
  async (dto, { rejectWithValue }) => {
    const token = localStorage.getItem('jwt');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const res = await api.post('/api/inventories', dto, config);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create inventory');
    }
  }
);

// 🔹 Update inventory
export const updateInventory = createAsyncThunk(
  'inventory/update',
  async (payload, { rejectWithValue }) => {
    const token = localStorage.getItem('jwt');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const id = payload?.id;
      const body = payload?.dto ? payload.dto : payload;
      const res = await api.put(`/api/inventories/${id}`, body, config);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update inventory');
    }
  }
);

// 🔹 Delete inventory
export const deleteInventory = createAsyncThunk(
  'inventory/delete',
  async (id, { rejectWithValue }) => {
    const token = localStorage.getItem('jwt');
     const config = {
       headers: {
         Authorization: `Bearer ${token}`,
       },
     };
    try {
      await api.delete(`/api/inventories/${id}`, config);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete inventory');
    }
  }
);

// 🔹 Get inventory by ID
export const getInventoryById = createAsyncThunk(
  'inventory/getById',
  async (id, { rejectWithValue }) => {
    const token = localStorage.getItem('jwt');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const res = await api.get(`/api/inventories/${id}`, config);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Inventory not found');
    }
  }
);

// 🔹 Get inventory by branch ID
export const getInventoryByBranch = createAsyncThunk(
  'inventory/getByBranch',
  async (branchId, { rejectWithValue }) => {
    const token = localStorage.getItem('jwt');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const res = await api.get(`/api/inventories/branch/${branchId}`, config);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch branch inventory');
    }
  }
);

// 🔹 Get inventory by product ID
export const getInventoryByProduct = createAsyncThunk(
  'inventory/getByProduct',
  async (productId, { rejectWithValue }) => {
    const token = localStorage.getItem('jwt');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const res = await api.get(`/api/inventories/product/${productId}`, config);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch product inventory');
    }
  }
);
