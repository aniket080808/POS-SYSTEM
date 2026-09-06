import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../utils/api';
import { getUserProfile } from '../user/userThunks';
import { getStoreByAdmin } from '../store/storeThunks';

// Complete onboarding process
export const completeOnboarding = createAsyncThunk(
  'onboarding/complete',
  async (onboardingData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post('/auth/onboarding', onboardingData);
      const data = res.data.data;
      if (data && data.jwt) {
        localStorage.setItem('jwt', data.jwt);
        // Hydrate profile and store state into Redux before completing thunk
        try {
          await dispatch(getUserProfile(data.jwt)).unwrap();
          await dispatch(getStoreByAdmin(data.jwt)).unwrap();
        } catch (hydrationError) {
        }
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Onboarding failed');
    }
  }
); 