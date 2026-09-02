import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../utils/api";

// ✅ Signup
export const signup = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/signup", userData);
      localStorage.setItem("jwt", res.data.data.jwt);
      return res.data.data;
    } catch (err) {
      console.error("Signup error:", err);
      return rejectWithValue(err.response?.data?.message || "Signup failed");
    }
  }
);

// ✅ Login
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", credentials);
      const data = res.data.data;
      localStorage.setItem("jwt", data.jwt);
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      return data;
    } catch (err) {
      console.error("Login error:", err);
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

// ✅ Forgot Password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/forgot-password", { email });
      return res.data;
    } catch (err) {
      console.error("Forgot password error:", err);
      return rejectWithValue(err.response?.data?.message || "Failed to send reset email");
    }
  }
);

// ✅ Reset Password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/reset-password", { token, password });
      return res.data;
    } catch (err) {
      console.error("Reset password error:", err);
      return rejectWithValue(err.response?.data?.message || "Failed to reset password");
    }
  }
);