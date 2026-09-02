import { createSlice } from '@reduxjs/toolkit';
import {
  createStoreEmployee,
  createBranchEmployee,
  updateEmployee,
  deleteEmployee,
  findEmployeeById,
  findStoreEmployees,
  findBranchEmployees,
  toggleEmployeeAccess,
  resetEmployeePassword,
  getEmployeePerformance,
} from './employeeThunks';

const initialState = {
  employees: [],
  employee: null,
  loading: false,
  error: null,
  performance: null,
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    clearEmployeeState: (state) => {
      state.employee = null;
      state.employees = [];
      state.error = null;
      state.performance = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createStoreEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStoreEmployee.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && !state.employees.some((e) => e.id === action.payload.id)) {
          state.employees.push(action.payload);
        }
      })
      .addCase(createStoreEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createBranchEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBranchEmployee.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && !state.employees.some((e) => e.id === action.payload.id)) {
          state.employees.push(action.payload);
        }
      })
      .addCase(createBranchEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.employees.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      })

      .addCase(deleteEmployee.pending, (state, action) => {
        const empId = typeof action.meta.arg === "object"
          ? (action.meta.arg.employeeId || action.meta.arg.id)
          : action.meta.arg;
        if (empId) {
          state.employees = state.employees.filter((e) => e.id !== empId);
        }
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter((e) => e.id !== action.payload);
      })

      .addCase(findEmployeeById.fulfilled, (state, action) => {
        state.employee = action.payload;
      })

      .addCase(findStoreEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(findStoreEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(findStoreEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(findBranchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(findBranchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(findBranchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(toggleEmployeeAccess.fulfilled, (state, action) => {
        const index = state.employees.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      })

      .addCase(resetEmployeePassword.fulfilled, (state, action) => {
        const index = state.employees.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      })

      .addCase(getEmployeePerformance.fulfilled, (state, action) => {
        state.performance = action.payload;
      })

      .addMatcher(
        (action) => action.type.startsWith('employee/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearEmployeeState } = employeeSlice.actions;
export default employeeSlice.reducer;