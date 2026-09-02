import { createSlice } from "@reduxjs/toolkit";
import {
  scanSupplierInvoice,
  getUpsellSuggestions,
  importExtractedInvoice,
} from "./aiThunks";

const initialState = {
  // Invoice OCR state
  invoiceExtraction: null,
  scanningInvoice: false,
  scanError: null,
  importingInvoice: false,
  importSuccess: false,

  // Upsell recommendation state
  upsellSuggestions: [],
  upsellPitch: "",
  upsellLoading: false,
};

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    clearInvoiceExtraction: (state) => {
      state.invoiceExtraction = null;
      state.scanError = null;
      state.importSuccess = false;
    },
    clearUpsellSuggestions: (state) => {
      state.upsellSuggestions = [];
      state.upsellPitch = "";
    },
  },
  extraReducers: (builder) => {
    // 1. Scan Invoice
    builder
      .addCase(scanSupplierInvoice.pending, (state) => {
        state.scanningInvoice = true;
        state.scanError = null;
      })
      .addCase(scanSupplierInvoice.fulfilled, (state, action) => {
        state.scanningInvoice = false;
        state.invoiceExtraction = action.payload;
      })
      .addCase(scanSupplierInvoice.rejected, (state, action) => {
        state.scanningInvoice = false;
        state.scanError = action.payload;
      });

    // 2. Upsell Suggestions
    builder
      .addCase(getUpsellSuggestions.pending, (state) => {
        state.upsellLoading = true;
      })
      .addCase(getUpsellSuggestions.fulfilled, (state, action) => {
        state.upsellLoading = false;
        state.upsellSuggestions = action.payload.recommendations || [];
        state.upsellPitch = action.payload.pitchMessage || "";
      })
      .addCase(getUpsellSuggestions.rejected, (state) => {
        state.upsellLoading = false;
      });

    // 3. Import Extracted Invoice
    builder
      .addCase(importExtractedInvoice.pending, (state) => {
        state.importingInvoice = true;
      })
      .addCase(importExtractedInvoice.fulfilled, (state) => {
        state.importingInvoice = false;
        state.importSuccess = true;
      })
      .addCase(importExtractedInvoice.rejected, (state) => {
        state.importingInvoice = false;
      });
  },
});

export const {
  clearInvoiceExtraction,
  clearUpsellSuggestions,
} = aiSlice.actions;

export default aiSlice.reducer;
