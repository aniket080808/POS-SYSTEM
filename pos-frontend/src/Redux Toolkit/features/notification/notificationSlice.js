import { createSlice } from '@reduxjs/toolkit';
import { fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } from './notificationThunks';
import { logout } from '../user/userThunks';

const initialState = {
  notifications: [],
  unreadCount: 0,
  totalPages: 0,
  currentPage: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addWebSocketNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    syncUnreadCount: (state, action) => {
        state.unreadCount = action.payload;
    },
    resetNotifications: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => initialState)
      .addCase('auth/logout', () => initialState)
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        if (action.meta.arg.page === 0) {
            state.notifications = action.payload.content;
        } else {
            state.notifications = [...state.notifications, ...action.payload.content];
        }
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.number;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = typeof action.payload === 'number' ? action.payload : 0;
      })
      .addCase(fetchUnreadCount.rejected, (state) => {
        // If unread count fetch fails, don't keep dirty/stale state
        state.unreadCount = 0;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notif = state.notifications.find(n => n.id === action.payload);
        if (notif && !notif.read) {
          notif.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => n.read = true);
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notif = state.notifications.find(n => n.id === action.payload);
        if (notif && !notif.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
      })
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
      });
  }
});

export const { addWebSocketNotification, syncUnreadCount, resetNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
