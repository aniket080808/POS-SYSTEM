import { createSlice } from '@reduxjs/toolkit';
import {
  fetchStoreSubscriptionStatus,
  resubmitRegistration,
  resubmitSubscriptionRequest,
} from './storeSubscriptionThunks';

const initialState = {
  statusResponse: null,
  loading: false,
  error: null,
  resubmitSuccessMsg: null,
};

const storeSubscriptionSlice = createSlice({
  name: 'storeSubscription',
  initialState,
  reducers: {
    clearStoreSubscriptionState: (state) => {
      state.error = null;
      state.resubmitSuccessMsg = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchStoreSubscriptionStatus
      .addCase(fetchStoreSubscriptionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoreSubscriptionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.statusResponse = action.payload;
      })
      .addCase(fetchStoreSubscriptionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // resubmitRegistration
      .addCase(resubmitRegistration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resubmitRegistration.fulfilled, (state, action) => {
        state.loading = false;
        state.resubmitSuccessMsg = action.payload?.message;
        if (state.statusResponse) {
          state.statusResponse.registrationStatus = 'PENDING';
          state.statusResponse.registrationRejectionReason = null;
        }
      })
      .addCase(resubmitRegistration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // resubmitSubscriptionRequest
      .addCase(resubmitSubscriptionRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resubmitSubscriptionRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.resubmitSuccessMsg = action.payload?.message;
        if (action.payload?.requiresPayment === false && state.statusResponse) {
          state.statusResponse.subscriptionStatus = 'PENDING';
          state.statusResponse.subscriptionRejectionReason = null;
        }
      })
      .addCase(resubmitSubscriptionRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStoreSubscriptionState } = storeSubscriptionSlice.actions;
export default storeSubscriptionSlice.reducer;
