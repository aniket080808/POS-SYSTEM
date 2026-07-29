import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/utils/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const fetchApprovalRequests = createAsyncThunk(
  'approvalRequest/fetchRequests',
  async ({ type, status } = {}, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const params = {};
      if (type) params.type = type;
      if (status) params.status = status;
      const res = await api.get('/api/super-admin/requests', { headers, params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch approval requests');
    }
  }
);

export const fetchPendingRequestCounts = createAsyncThunk(
  'approvalRequest/fetchCounts',
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get('/api/super-admin/requests/counts', { headers });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch pending counts');
    }
  }
);

export const approveApprovalRequest = createAsyncThunk(
  'approvalRequest/approve',
  async ({ requestId, adminNotes }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.put(
        `/api/super-admin/requests/${requestId}/approve`,
        { adminNotes },
        { headers }
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to approve request');
    }
  }
);

export const rejectApprovalRequest = createAsyncThunk(
  'approvalRequest/reject',
  async ({ requestId, reason }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.put(
        `/api/super-admin/requests/${requestId}/reject`,
        { reason },
        { headers }
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to reject request');
    }
  }
);
