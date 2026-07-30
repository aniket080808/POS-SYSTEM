import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/utils/api';

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

// Helper function to open Razorpay checkout modal
const openRazorpayCheckout = (orderData) => {
  return new Promise((resolve, reject) => {
    if (typeof window.Razorpay === 'undefined') {
      reject(new Error('Razorpay SDK not loaded. Please refresh the page.'));
      return;
    }

    const options = {
      key: orderData.razorpayKeyId,
      amount: orderData.amount * 100, // amount in paisa
      currency: orderData.currency || 'INR',
      name: 'POS System',
      description: orderData.description || 'Subscription Payment',
      order_id: orderData.razorpayOrderId,
      handler: function (response) {
        // Payment successful - redirect to success page with payment details
        const params = new URLSearchParams({
          payment: 'success',
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature
        });
        window.location.href = `/store/upgrade?${params.toString()}`;
        resolve(response);
      },
      modal: {
        ondismiss: function () {
          // Payment modal closed without completing
          window.location.href = '/store/upgrade?payment=failed';
          reject(new Error('Payment cancelled by user'));
        }
      },
      prefill: {
        name: orderData.userName || '',
        email: orderData.userEmail || '',
        contact: orderData.userPhone || ''
      },
      theme: {
        color: '#6366f1'
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  });
};

// 🆕 Store subscribes to a plan (TRIAL or NEW)
export const subscribeToPlan = createAsyncThunk(
  'subscription/subscribe',
  async ({ storeId, planId, gateway = 'RAZORPAY', transactionId }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const params = { storeId, planId, gateway };
      if (transactionId) params.transactionId = transactionId;
      const search = new URLSearchParams(params).toString();
      const res = await api.post(`/api/subscriptions/subscribe?${search}`, {}, { headers });
      if (res.data && res.data.razorpayOrderId) {
        // Open Razorpay checkout modal with order data
        await openRazorpayCheckout(res.data);
      }
      console.log('✅ Subscribed to plan:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Failed to subscribe to plan:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || 'Failed to subscribe to plan');
    }
  }
);

// 🔁 Store upgrades to a new plan (ACTIVE)
export const upgradeSubscription = createAsyncThunk(
  'subscription/upgrade',
  async ({ storeId, planId, gateway = 'RAZORPAY', transactionId }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const params = { storeId, planId, gateway };
      if (transactionId) params.transactionId = transactionId;
      const search = new URLSearchParams(params).toString();
      const res = await api.post(`/api/subscriptions/upgrade?${search}`, {}, { headers });
      if (res.data && res.data.razorpayOrderId) {
        // Open Razorpay checkout modal with order data
        await openRazorpayCheckout(res.data);
      }
      console.log('✅ Upgraded subscription:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Failed to upgrade subscription:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || 'Failed to upgrade subscription');
    }
  }
);

// ✅ Admin activates a subscription
export const activateSubscription = createAsyncThunk(
  'subscription/activate',
  async (subscriptionId, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.put(`/api/subscriptions/${subscriptionId}/activate`, {}, { headers });
      console.log('✅ Activated subscription:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Failed to activate subscription:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || 'Failed to activate subscription');
    }
  }
);

// ❌ Admin cancels a subscription
export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async (subscriptionId, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.put(`/api/subscriptions/${subscriptionId}/cancel`, {}, { headers });
      console.log('✅ Cancelled subscription:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Failed to cancel subscription:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || 'Failed to cancel subscription');
    }
  }
);

// 💳 Update payment status manually
export const updatePaymentStatus = createAsyncThunk(
  'subscription/updatePaymentStatus',
  async ({ subscriptionId, status }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.put(`/api/subscriptions/${subscriptionId}/payment-status?status=${status}`, {}, { headers });
      console.log('✅ Updated payment status:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Failed to update payment status:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || 'Failed to update payment status');
    }
  }
);

// 📦 Store: Get all subscriptions (or by status)
export const getStoreSubscriptions = createAsyncThunk(
  'subscription/getStoreSubscriptions',
  async ({ storeId, status }, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      let url = `/api/subscriptions/store/${storeId}`;
      if (status) url += `?status=${status}`;
      const res = await api.get(url, { headers });
      console.log('✅ fetch  Store subscriptions:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Failed to fetch store subscriptions:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch store subscriptions');
    }
  }
);

// 🗂️ Admin: Get all subscriptions (optionally filter by status)
export const getAllSubscriptions = createAsyncThunk(
  'subscription/getAllSubscriptions',
  async (status, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      let url = '/api/subscriptions/admin';
      if (status) url += `?status=${status}`;
      const res = await api.get(url, { headers });
      console.log('✅ All subscriptions:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Failed to fetch all subscriptions:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch all subscriptions');
    }
  }
);

// ⌛ Admin: Get subscriptions expiring within X days
export const getExpiringSubscriptions = createAsyncThunk(
  'subscription/getExpiringSubscriptions',
  async (days = 7, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/subscriptions/admin/expiring?days=${days}`, { headers });
      console.log('✅ Expiring subscriptions:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Failed to fetch expiring subscriptions:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch expiring subscriptions');
    }
  }
);

// 📊 Count total subscriptions by status
export const countSubscriptionsByStatus = createAsyncThunk(
  'subscription/countByStatus',
  async (status, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const res = await api.get(`/api/subscriptions/admin/count?status=${status}`, { headers });
      console.log('✅ Count by status:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Failed to count subscriptions:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || 'Failed to count subscriptions');
    }
  }
); 