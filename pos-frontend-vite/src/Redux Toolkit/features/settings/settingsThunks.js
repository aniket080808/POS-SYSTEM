import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/utils/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const fetchSystemSettings = createAsyncThunk(
  'settings/fetchSystemSettings',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/api/super-admin/settings/system', { headers: getAuthHeaders() });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch system settings');
    }
  }
);

export const updateSystemSetting = createAsyncThunk(
  'settings/updateSystemSetting',
  async ({ key, value }, { rejectWithValue }) => {
    try {
      await api.put('/api/super-admin/settings/system', { key, value }, { headers: getAuthHeaders() });
      return { key, value };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update system setting');
    }
  }
);

export const fetchNotificationPreferences = createAsyncThunk(
  'settings/fetchNotificationPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/api/super-admin/settings/notification-preferences', { headers: getAuthHeaders() });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch notification preferences');
    }
  }
);

export const updateNotificationPreferences = createAsyncThunk(
  'settings/updateNotificationPreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const res = await api.put('/api/super-admin/settings/notification-preferences', preferences, { headers: getAuthHeaders() });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update notification preferences');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'settings/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await api.put('/api/super-admin/settings/profile', profileData, { headers: getAuthHeaders() });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const changePassword = createAsyncThunk(
  'settings/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      await api.put('/api/super-admin/settings/password', passwordData, { headers: getAuthHeaders() });
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to change password');
    }
  }
);
