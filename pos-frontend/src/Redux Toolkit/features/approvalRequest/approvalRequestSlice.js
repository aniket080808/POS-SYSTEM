import { createSlice } from '@reduxjs/toolkit';
import {
  fetchApprovalRequests,
  fetchPendingRequestCounts,
  approveApprovalRequest,
  rejectApprovalRequest,
} from './approvalRequestThunks';

const initialState = {
  requests: [],
  pendingCounts: { registrationPending: 0, subscriptionPending: 0 },
  loading: false,
  error: null,
};

const approvalRequestSlice = createSlice({
  name: 'approvalRequest',
  initialState,
  reducers: {
    clearApprovalRequestState: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApprovalRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApprovalRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchApprovalRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchPendingRequestCounts.fulfilled, (state, action) => {
        state.pendingCounts = action.payload;
      })

      .addCase(approveApprovalRequest.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated || updated.id === undefined) return;
        state.requests = state.requests.map((r) => (r.id === updated.id ? updated : r));
        if (updated.type === 'STORE_REGISTRATION') {
          state.pendingCounts.registrationPending = Math.max(0, state.pendingCounts.registrationPending - 1);
        } else {
          state.pendingCounts.subscriptionPending = Math.max(0, state.pendingCounts.subscriptionPending - 1);
        }
      })

      .addCase(rejectApprovalRequest.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated || updated.id === undefined) return;
        state.requests = state.requests.map((r) => (r.id === updated.id ? updated : r));
        if (updated.type === 'STORE_REGISTRATION') {
          state.pendingCounts.registrationPending = Math.max(0, state.pendingCounts.registrationPending - 1);
        } else {
          state.pendingCounts.subscriptionPending = Math.max(0, state.pendingCounts.subscriptionPending - 1);
        }
      });
  },
});

export const { clearApprovalRequestState } = approvalRequestSlice.actions;
export default approvalRequestSlice.reducer;