import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utils/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("jwt");
  if (!token) throw new Error("No JWT token found");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const fetchStoreSettings = createAsyncThunk(
  "storeSettings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/stores/settings", { headers: getAuthHeaders() });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch store settings");
    }
  }
);

export const updateStoreSettings = createAsyncThunk(
  "storeSettings/update",
  async (settingsData, { rejectWithValue }) => {
    try {
      const res = await api.put("/api/stores/settings", settingsData, { headers: getAuthHeaders() });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update store settings");
    }
  }
);