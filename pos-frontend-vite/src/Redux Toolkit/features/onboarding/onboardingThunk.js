import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../utils/api';

// Complete onboarding process
export const completeOnboarding = createAsyncThunk(
  'onboarding/complete',
  async (onboardingData, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/onboarding', onboardingData);
      const data = res.data.data;
      if (data && data.jwt) {
        localStorage.setItem('jwt', data.jwt);
      }
      console.log('Onboarding complete success:', data);
      return data;
    } catch (err) {
      console.error('Onboarding complete error:', err);
      return rejectWithValue(err.response?.data?.message || 'Onboarding failed');
    }
  }
); 