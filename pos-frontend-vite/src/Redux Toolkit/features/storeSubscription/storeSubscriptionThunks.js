import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/utils/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const fetchStoreSubscriptionStatus = createAsyncThunk(
  'storeSubscription/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get('/api/store-subscription/status', { headers });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch store subscription status');
    }
  }
);

export const resubmitRegistration = createAsyncThunk(
  'storeSubscription/resubmitRegistration',
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.post('/api/approval-requests/re-register', {}, { headers });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to resubmit store registration');
    }
  }
);

export const resubmitSubscriptionRequest = createAsyncThunk(
  'storeSubscription/resubmitSubscription',
  async ({ planId }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.post(`/api/approval-requests/re-request-subscription?planId=${planId}`, {}, { headers });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to resubmit subscription request');
    }
  }
);
