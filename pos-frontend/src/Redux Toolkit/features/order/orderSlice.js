import { createSlice } from '@reduxjs/toolkit';
import {
  createOrder,
  getOrderById,
  getOrdersByBranch,
  getOrdersByCashier,
  getTodayOrdersByBranch,
  deleteOrder,
  getOrdersByCustomer,
  getRecentOrdersByBranch,
  getPaginatedOrders
} from './orderThunks';

const initialState = {
  orders: [],
  todayOrders: [],
  customerOrders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  recentOrders: [], // Added for recent orders
  paginatedOrders: {
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: 10,
  },
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderState: (state) => {
      state.orders = [];
      state.todayOrders = [];
      state.customerOrders = [];
      state.selectedOrder = null;
      state.error = null;
    },
    clearCustomerOrders: (state) => {
      state.customerOrders = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
        state.selectedOrder=action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getOrdersByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrdersByBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
      })
      .addCase(getOrdersByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getOrdersByCashier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrdersByCashier.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
      })
      .addCase(getOrdersByCashier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getTodayOrdersByBranch.fulfilled, (state, action) => {
        state.todayOrders = action.payload;
      })

      .addCase(getOrdersByCustomer.fulfilled, (state, action) => {
        state.customerOrders = action.payload;
      })

      .addCase(getRecentOrdersByBranch.fulfilled, (state, action) => {
        state.recentOrders = action.payload;
      })

      .addCase(getPaginatedOrders.fulfilled, (state, action) => {
        state.paginatedOrders = action.payload;
        state.loading = false;
      })

      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter((o) => o.id !== action.payload);
      })

      .addMatcher(
        (action) => action.type.startsWith('order/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.error = action.payload;
        }
      );
  },
});

export const { clearOrderState, clearCustomerOrders } = orderSlice.actions;
export default orderSlice.reducer;
