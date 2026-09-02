import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utils/api";

export const parkHeldOrder = createAsyncThunk(
  "heldOrder/parkHeldOrder",
  async (orderPayload, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/cashier/held-orders", orderPayload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to hold order"
      );
    }
  }
);

export const fetchHeldOrders = createAsyncThunk(
  "heldOrder/fetchHeldOrders",
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/cashier/held-orders", {
        params: { branchId },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch held orders"
      );
    }
  }
);

export const recallAndDeleteHeldOrder = createAsyncThunk(
  "heldOrder/recallAndDeleteHeldOrder",
  async (heldOrderId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/cashier/held-orders/${heldOrderId}`);
      return heldOrderId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to remove held order"
      );
    }
  }
);
