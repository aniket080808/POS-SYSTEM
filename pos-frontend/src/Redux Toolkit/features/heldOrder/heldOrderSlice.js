import { createSlice } from "@reduxjs/toolkit";
import {
  parkHeldOrder,
  fetchHeldOrders,
  recallAndDeleteHeldOrder,
} from "./heldOrderThunks";

const initialState = {
  heldOrders: [],
  loading: false,
  error: null,
};

const heldOrderSlice = createSlice({
  name: "heldOrder",
  initialState,
  reducers: {
    clearHeldOrders: (state) => {
      state.heldOrders = [];
    },
  },
  extraReducers: (builder) => {
    // 1. Fetch
    builder
      .addCase(fetchHeldOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHeldOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.heldOrders = action.payload || [];
      })
      .addCase(fetchHeldOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // 2. Park
    builder
      .addCase(parkHeldOrder.fulfilled, (state, action) => {
        state.heldOrders.unshift(action.payload);
      });

    // 3. Recall & Delete
    builder
      .addCase(recallAndDeleteHeldOrder.fulfilled, (state, action) => {
        state.heldOrders = state.heldOrders.filter((o) => o.id !== action.payload);
      });
  },
});

export const { clearHeldOrders } = heldOrderSlice.actions;
export default heldOrderSlice.reducer;
