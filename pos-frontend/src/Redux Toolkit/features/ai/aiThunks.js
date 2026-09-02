import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utils/api";

// 1. Scan Supplier Invoice using Groq Vision OCR
export const scanSupplierInvoice = createAsyncThunk(
  "ai/scanSupplierInvoice",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/ai/scan-invoice", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data && response.data.success) {
        return response.data;
      }
      return rejectWithValue(response.data?.errorMessage || "Failed to parse invoice with AI");
    } catch (error) {
      const message =
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        error.message ||
        "Invoice scan failed";
      return rejectWithValue(message);
    }
  }
);


// 3. Get Cart Upsell / Cross-sell Recommendations
export const getUpsellSuggestions = createAsyncThunk(
  "ai/getUpsellSuggestions",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/ai/upsell-suggestions", payload);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch upsell recommendations";
      return rejectWithValue(message);
    }
  }
);

// 4. Batch Import Extracted Line Items to Store Inventory
export const importExtractedInvoice = createAsyncThunk(
  "ai/importExtractedInvoice",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/ai/import-extracted-invoice", payload);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        error.message ||
        "Failed to import extracted inventory";
      return rejectWithValue(message);
    }
  }
);
