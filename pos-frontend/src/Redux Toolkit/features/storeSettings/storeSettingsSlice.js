import { createSlice } from "@reduxjs/toolkit";
import { fetchStoreSettings, updateStoreSettings } from "./storeSettingsThunks";

const initialState = {
  settings: null,
  loading: false,
  error: null,
};

const storeSettingsSlice = createSlice({
  name: "storeSettings",
  initialState,
  reducers: {
    clearStoreSettings: (state) => {
      state.settings = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoreSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoreSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchStoreSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateStoreSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStoreSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(updateStoreSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStoreSettings } = storeSettingsSlice.actions;
export default storeSettingsSlice.reducer;