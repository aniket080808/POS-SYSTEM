// src/redux/slices/subscriptionPlanSlice.js

import { createSlice } from "@reduxjs/toolkit";
import {
  createSubscriptionPlan,
  updateSubscriptionPlan,
  getAllSubscriptionPlans,
  getSubscriptionPlanById,
  deleteSubscriptionPlan,
} from "./subscriptionPlanThunks.js";
import { fetchPublicPlans } from "./publicPlanThunks.js";

const initialState = {
  plans: [],
  selectedPlan: null,
  loading: false,
  hasFetched: false, // true after first successful fetch (even if empty)
  error: null,
};

const subscriptionPlanSlice = createSlice({
  name: "subscriptionPlan",
  initialState,
  reducers: {
    clearSelectedPlan: (state) => {
      state.selectedPlan = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ➕ Create
      .addCase(createSubscriptionPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubscriptionPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.plans.push(action.payload);
      })
      .addCase(createSubscriptionPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔄 Update
      .addCase(updateSubscriptionPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubscriptionPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = state.plans.map((plan) =>
          plan.id === action.payload.id ? action.payload : plan
        );
      })
      .addCase(updateSubscriptionPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 📦 Get All (authenticated — used from admin panels)
      .addCase(getAllSubscriptionPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllSubscriptionPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.hasFetched = true;
        state.plans = action.payload;
      })
      .addCase(getAllSubscriptionPlans.rejected, (state, action) => {
        state.loading = false;
        state.hasFetched = true;
        state.error = action.payload;
      })

      // 🌐 Fetch Public Plans (landing page — handles auth failure gracefully)
      .addCase(fetchPublicPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.hasFetched = true;
        state.plans = action.payload;
      })
      .addCase(fetchPublicPlans.rejected, (state, action) => {
        state.loading = false;
        state.hasFetched = true;
        state.error = action.payload;
      })

      // 🔍 Get by ID
      .addCase(getSubscriptionPlanById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubscriptionPlanById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPlan = action.payload;
      })
      .addCase(getSubscriptionPlanById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ❌ Delete
      .addCase(deleteSubscriptionPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubscriptionPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = state.plans.filter((plan) => plan.id !== action.payload);
      })
      .addCase(deleteSubscriptionPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedPlan, clearError } = subscriptionPlanSlice.actions;

export default subscriptionPlanSlice.reducer;
