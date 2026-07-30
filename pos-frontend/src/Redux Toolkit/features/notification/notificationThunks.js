import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/utils/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async ({ page = 0, size = 10, unreadOnly = false }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/super-admin/notifications?page=${page}&size=${size}&unreadOnly=${unreadOnly}`, {
        headers: getAuthHeaders(),
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/api/super-admin/notifications/unread-count', {
        headers: getAuthHeaders(),
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      await api.put(`/api/super-admin/notifications/${id}/read`, {}, {
        headers: getAuthHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.put('/api/super-admin/notifications/read-all', {}, {
        headers: getAuthHeaders(),
      });
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/super-admin/notifications/${id}`, {
        headers: getAuthHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete notification');
    }
  }
);

export const deleteAllNotifications = createAsyncThunk(
  'notification/deleteAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/api/super-admin/notifications/all', {
        headers: getAuthHeaders(),
      });
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete all notifications');
    }
  }
);
