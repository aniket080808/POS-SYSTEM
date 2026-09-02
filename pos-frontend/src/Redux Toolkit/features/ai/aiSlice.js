import { createSlice } from "@reduxjs/toolkit";
import {
  scanSupplierInvoice,
  queryCopilot,
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

  // Copilot conversational state
  copilotHistory: [
    {
      role: "assistant",
      content:
        "👋 Hello! I am your **Gemini Retail Copilot**. Ask me anything about today's sales, low stock alerts, inventory turnover, or reorder forecasts!",
      timestamp: new Date().toISOString(),
      intent: "GREETING",
      suggestedFollowUps: [
        "What are our top selling items today?",
        "Which products need urgent reordering?",
        "Show revenue & profit summary for this week",
      ],
    },
  ],
  copilotLoading: false,
  copilotError: null,

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
    clearCopilotHistory: (state) => {
      state.copilotHistory = initialState.copilotHistory;
    },
    addUserCopilotMessage: (state, action) => {
      state.copilotHistory.push({
        role: "user",
        content: action.payload,
        timestamp: new Date().toISOString(),
      });
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

    // 2. Query Copilot
    builder
      .addCase(queryCopilot.pending, (state) => {
        state.copilotLoading = true;
        state.copilotError = null;
      })
      .addCase(queryCopilot.fulfilled, (state, action) => {
        state.copilotLoading = false;
        state.copilotHistory.push({
          role: "assistant",
          content: action.payload.answerMarkdown || "Response generated.",
          intent: action.payload.intent,
          suggestedFollowUps: action.payload.suggestedFollowUps || [],
          dataSnapshot: action.payload.dataSnapshot,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(queryCopilot.rejected, (state, action) => {
        state.copilotLoading = false;
        state.copilotError = action.payload;
        state.copilotHistory.push({
          role: "assistant",
          content: `⚠️ ${action.payload || "Could not process your query at this time. Please ensure GEMINI_API_KEY is configured."}`,
          isError: true,
          timestamp: new Date().toISOString(),
        });
      });

    // 3. Upsell Suggestions
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

    // 4. Import Extracted Invoice
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
  clearCopilotHistory,
  addUserCopilotMessage,
  clearUpsellSuggestions,
} = aiSlice.actions;

export default aiSlice.reducer;
