import { createSlice } from '@reduxjs/toolkit';
import { fetchSystemSettings, updateSystemSetting, fetchNotificationPreferences, updateNotificationPreferences } from './settingsThunks';

const initialState = {
  systemSettings: {},
  notificationPreferences: {},
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemSettings.fulfilled, (state, action) => {
        state.systemSettings = action.payload;
      })
      .addCase(updateSystemSetting.pending, (state, action) => {
        const { key, value } = action.meta.arg;
        state.systemSettings[key] = value;
      })
      .addCase(updateSystemSetting.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchNotificationPreferences.fulfilled, (state, action) => {
        state.notificationPreferences = action.payload;
      })
      .addCase(updateNotificationPreferences.pending, (state, action) => {
        state.notificationPreferences = { ...state.notificationPreferences, ...action.meta.arg };
      })
      .addCase(updateNotificationPreferences.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export default settingsSlice.reducer;
