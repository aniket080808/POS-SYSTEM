// src/Redux Toolkit/features/subscriptionPlan/publicPlanThunks.js
// Public-facing thunk for fetching subscription plans on the landing page.
// Attempts to call the plans API without requiring authentication.
// If the backend requires auth for this endpoint and no JWT is present,
// this thunk returns an empty array (triggering an empty/coming-soon state).

import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utils/api";

export const fetchPublicPlans = createAsyncThunk(
  "subscriptionPlan/fetchPublic",
  async (_, { rejectWithValue }) => {
    try {
      // Try with JWT if available (user happens to be logged in)
      const token = localStorage.getItem("jwt");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const res = await api.get("/api/subscription-plans", config);
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      // If endpoint requires auth and user is not logged in,
      // return empty array — NOT an error. The UI will show
      // "Plans coming soon" instead of fake fallback data.
      if (err.response?.status === 401 || err.response?.status === 403) {
        return [];
      }
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch plans"
      );
    }
  }
);
