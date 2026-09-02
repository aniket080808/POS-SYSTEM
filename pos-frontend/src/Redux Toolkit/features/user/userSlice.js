import { createSlice } from '@reduxjs/toolkit';
import {
  getUserProfile,
  getCustomers,
  getCashiers,
  getAllUsers,
  getUserById,
  logout
} from './userThunks';

const initialState = {
  userProfile: null,
  users: [],
  customers: [],
  cashiers: [],
  selectedUser: null,
  loading: false,
  userProfileChecked: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
      state.loading = false;
      state.userProfileChecked = true;
    },
    clearUserState: (state) => {
      state.userProfile = null;
      state.selectedUser = null;
      state.users = [];
      state.customers = [];
      state.cashiers = [];
      state.userProfileChecked = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserProfile.pending, (state) => { state.loading = true; })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userProfileChecked = true;
        state.userProfile = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.userProfileChecked = true;
        state.error = action.payload;
      })

      .addCase(getCustomers.fulfilled, (state, action) => {
        state.customers = action.payload;
      })

      .addCase(getCashiers.fulfilled, (state, action) => {
        state.cashiers = action.payload;
      })

      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })

      .addCase(getUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.userProfile = null;
        state.selectedUser = null;
        state.error = null;
      })

      .addMatcher(
        (action) => action.type.startsWith('user/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.error = action.payload;
        }
      );
  },
});

export const { setUserProfile, clearUserState } = userSlice.actions;
export default userSlice.reducer;
