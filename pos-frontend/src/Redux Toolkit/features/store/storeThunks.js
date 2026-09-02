import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utils/api";

// Helper function to get JWT token
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

// 🔹 Create store
export const createStore = createAsyncThunk(
  "store/create",
  async (storeData, { rejectWithValue }) => {
    try {
      console.log('🔄 Creating store...', { storeData });
      
      const headers = getAuthHeaders();
      const res = await api.post("/api/stores", storeData, { headers });
      
      console.log('✅ Store created successfully:', {
        storeId: res.data.id,
        brand: res.data.brand,
        storeType: res.data.storeType,
        response: res.data
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to create store:', {
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        requestData: storeData
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Failed to create store"
      );
    }
  }
);

// 🔹 Get store by ID
export const getStoreById = createAsyncThunk(
  "store/getById",
  async (id, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching store by ID...', { storeId: id });
      
      const headers = getAuthHeaders();
      const res = await api.get(`/api/stores/${id}`, { headers });
      
      console.log('✅ Store fetched successfully:', {
        storeId: res.data.id,
        brand: res.data.brand,
        storeType: res.data.storeType,
        response: res.data
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to fetch store by ID:', {
        storeId: id,
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Store not found"
      );
    }
  }
);

// 🔹 Get all stores
export const getAllStores = createAsyncThunk(
  "store/getAll",
  async (status, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching all stores...');
      
      const headers = getAuthHeaders();
      const res = await api.get("/api/stores", { headers,
        params: status ? { status } : undefined,
       });
      
      console.log('✅ All stores fetched successfully:', {
        storeCount: res.data.length,
        response: res.data
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to fetch all stores:', {
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch stores"
      );
    }
  }
);

// 🔹 Super Admin: Search stores with pagination + status + search term
export const searchStores = createAsyncThunk(
  "store/search",
  async ({ status, search, page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      console.log('🔄 Searching stores...', { status, search, page, size });
      
      const headers = getAuthHeaders();
      const params = {};
      if (status) params.status = status;
      if (search) params.search = search;
      params.page = page;
      params.size = size;
      
      const res = await api.get("/api/stores/search", { headers, params });
      
      console.log('✅ Stores search completed:', {
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
        currentPage: res.data.number,
        content: res.data.content
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to search stores:', {
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        params: { status, search, page, size }
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Failed to search stores"
      );
    }
  }
);

// 🔹 Update store
export const updateStore = createAsyncThunk(
  "store/update",
  async ({ id, storeData }, { rejectWithValue }) => {
    try {
      console.log('🔄 Updating store...', { storeId: id, storeData });
      
      const headers = getAuthHeaders();
      const res = await api.put(`/api/stores/${id}`, storeData, { headers });
      
      console.log('✅ Store updated successfully:', {
        storeId: res.data.id,
        brand: res.data.brand,
        storeType: res.data.storeType,
        response: res.data
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to update store:', {
        storeId: id,
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        requestData: storeData
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Failed to update store"
      );
    }
  }
);

// 🔹 Super Admin: Update any store by ID (resolves store by path param, not owner JWT)
export const updateStoreAsSuperAdmin = createAsyncThunk(
  "store/updateAsSuperAdmin",
  async ({ id, storeData }, { rejectWithValue }) => {
    try {
      console.log('🔄 Super admin updating store...', { storeId: id, storeData });
      
      const headers = getAuthHeaders();
      const res = await api.put(`/api/stores/super-admin/${id}`, storeData, { headers });
      
      console.log('✅ Store updated by super admin successfully:', {
        storeId: res.data.id,
        brand: res.data.brand,
        response: res.data
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to update store as super admin:', {
        storeId: id,
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        requestData: storeData
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Failed to update store"
      );
    }
  }
);

// 🔹 Delete store
export const deleteStore = createAsyncThunk(
  "store/delete",
  async (id, { rejectWithValue }) => {
    try {
      console.log('🔄 Deleting store...', { storeId: id });
      
      const headers = getAuthHeaders();
      const url = id ? `/api/stores/${id}` : "/api/stores";
      const res = await api.delete(url, { headers });
      
      console.log('✅ Store deleted successfully:', { response: res.data });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to delete store:', {
        storeId: id,
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete store"
      );
    }
  }
);

// 🔹 Get store by admin
export const getStoreByAdmin = createAsyncThunk(
  "store/getByAdmin",
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching store by admin...');
      
      const headers = getAuthHeaders();
      const res = await api.get("/api/stores/admin", { headers });
      
      console.log('✅ Store fetched by admin successfully:', {
        storeId: res.data.id,
        brand: res.data.brand,
        storeType: res.data.storeType,
        response: res.data
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to fetch store by admin:', {
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Not authorized"
      );
    }
  }
);

// 🔹 Get store by employee
export const getStoreByEmployee = createAsyncThunk(
  "store/getByEmployee",
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching store by employee...');
      
      const headers = getAuthHeaders();
      const res = await api.get("/api/stores/employee", { headers });
      
      console.log('✅ Store fetched by employee successfully:', {
        storeId: res.data.id,
        brand: res.data.brand,
        storeType: res.data.storeType,
        response: res.data
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to fetch store by employee:', {
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Not authorized"
      );
    }
  }
);

// 🔹 Get employee list by store
export const getStoreEmployees = createAsyncThunk(
  "store/getEmployees",
  async (storeId, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching store employees...', { storeId });
      
      const headers = getAuthHeaders();
      const res = await api.get(`/api/stores/${storeId}/employee/list`, { headers });
      
      console.log('✅ Store employees fetched successfully:', {
        storeId,
        employeeCount: res.data.length,
        employees: res.data.map(employee => ({
          id: employee.id,
          name: employee.name,
          role: employee.role
        }))
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to fetch store employees:', {
        storeId,
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Failed to get employees"
      );
    }
  }
);

// 🔹 Add employee
export const addEmployee = createAsyncThunk(
  "store/addEmployee",
  async (employeeData, { rejectWithValue }) => {
    try {
      console.log('🔄 Adding employee to store...', { employeeData });
      
      const headers = getAuthHeaders();
      const res = await api.post("/api/stores/add/employee", employeeData, { headers });
      
      console.log('✅ Employee added successfully:', {
        employeeId: res.data.id,
        name: res.data.name,
        role: res.data.role,
        response: res.data
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to add employee:', {
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        requestData: employeeData
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Failed to add employee"
      );
    }
  }
);

// 🔹 Get store subscription details (for super-admin store detail panel)
export const getStoreSubscription = createAsyncThunk(
  "store/getSubscription",
  async (storeId, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching store subscription...', { storeId });
      
      const headers = getAuthHeaders();
      const res = await api.get(`/api/stores/${storeId}/subscription`, { headers });
      
      console.log('✅ Store subscription fetched successfully:', {
        storeId,
        response: res.data
      });
      
      return res.data;
    } catch (err) {
      console.error('❌ Failed to fetch store subscription:', {
        storeId,
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch store subscription"
      );
    }
  }
);

// 🔹 Moderate store (approve/block/reject)
export const moderateStore = createAsyncThunk(
  "store/moderateStore",
  async ({ storeId, action }, { rejectWithValue }) => {
    try {
      console.log('🔄 Moderating store...', { storeId, action });
      const headers = getAuthHeaders();
      const res = await api.put(`/api/stores/${storeId}/moderate`, null, {
        headers,
        params: { action },
      });
      console.log('✅ Store moderated successfully:', {
        storeId: res.data.id,
        status: res.data.status,
        response: res.data
      });
      return res.data;
    } catch (err) {
      console.error('❌ Failed to moderate store:', {
        storeId,
        action,
        error: err.response?.data || err.message,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      return rejectWithValue(
        err.response?.data?.message || 'Failed to moderate store'
      );
    }
  }
);
