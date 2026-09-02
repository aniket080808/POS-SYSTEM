import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utils/api";


const getAuthToken = () => {
  const token = localStorage.getItem('jwt');
  if (!token) {
    throw new Error('No JWT token found');
  }
  return token;
};

// Helper function to set auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// 🔹 Create Store Employee
export const createStoreEmployee = createAsyncThunk(
  "employee/createStoreEmployee",
  async (payload, { rejectWithValue, getState }) => {
    try {
      const employee = payload.employee || payload.employeeData || payload;
      const state = getState();
      const storeId =
        payload.storeId ||
        employee?.storeId ||
        state.store?.store?.id ||
        state.user?.userProfile?.store?.id ||
        state.user?.userProfile?.storeId ||
        state.user?.user?.storeId;
      const token = payload.token || localStorage.getItem("jwt");

      if (!storeId) {
        throw new Error("Store ID is required to create a staff account");
      }

      const res = await api.post(`/api/employees/store/${storeId}`, employee, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      console.log("createStoreEmployee fulfilled:", res.data);
      return res.data;
    } catch (err) {
      console.error(
        "createStoreEmployee rejected:",
        err.response?.data?.message || err.message || "Failed to create store employee"
      );
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to create store employee"
      );
    }
  }
);

// 🔹 Create Branch Employee
export const createBranchEmployee = createAsyncThunk(
  "employee/createBranchEmployee",
  async (payload, { rejectWithValue }) => {
    try {
      const employee = payload.employee || payload.employeeData || payload;
      const branchId = payload.branchId || employee?.branchId;
      const token = payload.token || localStorage.getItem("jwt");

      if (!branchId) {
        throw new Error("Branch ID is required to create a branch staff member");
      }

      const res = await api.post(`/api/employees/branch/${branchId}`, employee, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      console.log("createBranchEmployee fulfilled:", res.data);
      return res.data;
    } catch (err) {
      console.error(
        "createBranchEmployee rejected:",
        err.response?.data?.message || err.message || "Failed to create branch employee"
      );
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to create branch employee"
      );
    }
  }
);

// 🔹 Update Employee
export const updateEmployee = createAsyncThunk(
  "employee/updateEmployee",
  async (payload, { rejectWithValue }) => {
    try {
      const empId = payload.employeeId || payload.id;
      const details = payload.employeeDetails || payload.employeeData || payload.data || payload;
      const token = payload.token || localStorage.getItem("jwt");

      const res = await api.put(`/api/employees/${empId}`, details, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      console.log("updateEmployee fulfilled:", res.data);
      return res.data;
    } catch (err) {
      console.error(
        "updateEmployee rejected:",
        err.response?.data?.message || err.message || "Failed to update employee"
      );
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to update employee"
      );
    }
  }
);

// 🔹 Delete Employee
export const deleteEmployee = createAsyncThunk(
  "employee/deleteEmployee",
  async (payload, { rejectWithValue }) => {
    try {
      const empId = typeof payload === "object" ? (payload.employeeId || payload.id) : payload;
      const token = (typeof payload === "object" && payload.token) || localStorage.getItem("jwt");

      await api.delete(`/api/employees/${empId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      console.log("deleteEmployee fulfilled:", empId);
      return empId;
    } catch (err) {
      console.error(
        "deleteEmployee rejected:",
        err.response?.data?.message || err.message || "Failed to delete employee"
      );
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to delete employee"
      );
    }
  }
);

// 🔹 Find Employee by ID
export const findEmployeeById = createAsyncThunk(
  "employee/findEmployeeById",
  async (payload, { rejectWithValue }) => {
    const employeeId = typeof payload === "object" ? (payload.employeeId || payload.id) : payload;
    const token = typeof payload === "object" ? payload.token : null;
    try {
      const res = await api.get(`/api/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${token || getAuthToken()}` },
      });
      console.log("findEmployeeById fulfilled:", res.data);
      return res.data;
    } catch (err) {
      console.error(
        "findEmployeeById rejected:",
        err.response?.data?.message || "Employee not found"
      );
      return rejectWithValue(
        err.response?.data?.message || "Employee not found"
      );
    }
  }
);

// 🔹 Find Store Employees
export const findStoreEmployees = createAsyncThunk(
  "employee/findStoreEmployees",
  async ({ storeId, token, role }, { rejectWithValue }) => {
    try {
      const params = role ? `?role=${role}` : '';
      const res = await api.get(`/api/employees/store/${storeId}${params}`, {
        headers: { Authorization: `Bearer ${token || getAuthToken()}` },
      });
      console.log("findStoreEmployees fulfilled:", res.data);
      return res.data;
    } catch (err) {
      console.error(
        "findStoreEmployees rejected:",
        err.response?.data?.message || "Failed to fetch store employees"
      );
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch store employees"
      );
    }
  }
);

// 🔹 Find Branch Employees
export const findBranchEmployees = createAsyncThunk(
  "employee/findBranchEmployees",
  async ({ branchId, role }, { rejectWithValue }) => {
    const params = [];
    if(role) params.push(`role=${role}`);
    const query = params.length ? `?${params.join('&')}` : '';

    try {
      const headers=getAuthHeaders();
      const res = await api.get(`/api/employees/branch/${branchId}${query}`, {headers});
      console.log("findBranchEmployees fulfilled:", res.data);
      return res.data;
    } catch (err) {
      console.error(
        "findBranchEmployees rejected:",
        err.response?.data?.message || "Failed to fetch branch employees"
      );
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch branch employees"
      );
    }
  }
);

// 🔹 Toggle Employee Login Access
export const toggleEmployeeAccess = createAsyncThunk(
  "employee/toggleEmployeeAccess",
  async (payload, { rejectWithValue }) => {
    const employeeId = typeof payload === "object" ? (payload.employeeId || payload.id) : payload;
    const token = typeof payload === "object" ? payload.token : null;
    try {
      const res = await api.put(
        `/api/employees/${employeeId}/toggle-access`,
        {},
        {
          headers: { Authorization: `Bearer ${token || getAuthToken()}` },
        }
      );
      console.log("toggleEmployeeAccess fulfilled:", res.data);
      return res.data;
    } catch (err) {
      console.error(
        "toggleEmployeeAccess rejected:",
        err.response?.data?.message || "Failed to toggle employee access"
      );
      return rejectWithValue(
        err.response?.data?.message || "Failed to toggle employee access"
      );
    }
  }
);

// 🔹 Reset Employee Password
export const resetEmployeePassword = createAsyncThunk(
  "employee/resetEmployeePassword",
  async (payload, { rejectWithValue }) => {
    const employeeId = typeof payload === "object" ? (payload.employeeId || payload.id) : payload;
    const newPassword = typeof payload === "object" ? payload.newPassword : "";
    const token = typeof payload === "object" ? payload.token : null;
    try {
      const res = await api.put(
        `/api/employees/${employeeId}/reset-password`,
        { newPassword },
        {
          headers: { Authorization: `Bearer ${token || getAuthToken()}` },
        }
      );
      console.log("resetEmployeePassword fulfilled:", res.data);
      return res.data;
    } catch (err) {
      console.error(
        "resetEmployeePassword rejected:",
        err.response?.data?.message || "Failed to reset employee password"
      );
      return rejectWithValue(
        err.response?.data?.message || "Failed to reset employee password"
      );
    }
  }
);

// 🔹 Get Employee Performance
export const getEmployeePerformance = createAsyncThunk(
  "employee/getEmployeePerformance",
  async (payload, { rejectWithValue }) => {
    const employeeId = typeof payload === "object" ? (payload.employeeId || payload.id) : payload;
    const token = typeof payload === "object" ? payload.token : null;
    try {
      const res = await api.get(`/api/employees/${employeeId}/performance`, {
        headers: { Authorization: `Bearer ${token || getAuthToken()}` },
      });
      console.log("getEmployeePerformance fulfilled:", res.data);
      return res.data;
    } catch (err) {
      console.error(
        "getEmployeePerformance rejected:",
        err.response?.data?.message || "Failed to fetch employee performance"
      );
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch employee performance"
      );
    }
  }
);