import { createSlice } from '@reduxjs/toolkit';
import {
  createStore,
  getStoreById,
  getAllStores,
  searchStores,
  updateStore,
  updateStoreAsSuperAdmin,
  deleteStore,
  getStoreByAdmin,
  getStoreByEmployee,
  getStoreEmployees,
  addEmployee,
  getStoreSubscription,
  moderateStore, // <-- Add this import
} from './storeThunks';

const initialState = {
  store: null,
  stores: [],
  employees: [],
  storeSubscription: null,
  loading: false,
  storeLoading: false,
  storeChecked: false,
  error: null,
  searchPage: {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
  },
};

const storeSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    setStore: (state, action) => {
      state.store = action.payload;
      state.storeLoading = false;
      state.storeChecked = true;
    },
    clearStoreState: (state) => {
      state.store = null;
      state.storeLoading = false;
      state.storeChecked = false;
      state.error = null;
      state.employees = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createStore.pending, (state) => {
        state.loading = true;
      })
      .addCase(createStore.fulfilled, (state, action) => {
        state.loading = false;
        state.store = action.payload;
      })
      .addCase(createStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getStoreById.fulfilled, (state, action) => {
        state.store = action.payload;
      })
      .addCase(getAllStores.fulfilled, (state, action) => {
        state.stores = action.payload;
      })
      .addCase(searchStores.fulfilled, (state, action) => {
        const page = action.payload;
        state.searchPage = {
          content: page.content || [],
          totalElements: page.totalElements || 0,
          totalPages: page.totalPages || 0,
          number: page.number || 0,
          size: page.size || 10,
        };
      })
      .addCase(updateStore.fulfilled, (state, action) => {
        state.store = action.payload;
      })
      .addCase(updateStoreAsSuperAdmin.fulfilled, (state, action) => {
        const updated = action.payload;
        state.store = updated;
        state.stores = state.stores.map(store =>
          store.id === updated.id ? updated : store
        );
        if (state.searchPage && Array.isArray(state.searchPage.content)) {
          state.searchPage.content = state.searchPage.content.map(store =>
            store.id === updated.id ? updated : store
          );
        }
      })
      .addCase(deleteStore.fulfilled, (state) => {
        state.store = null;
        state.storeChecked = true;
      })
      .addCase(getStoreByAdmin.pending, (state) => {
        state.storeLoading = true;
      })
      .addCase(getStoreByAdmin.fulfilled, (state, action) => {
        state.storeLoading = false;
        state.storeChecked = true;
        state.store = action.payload;
      })
      .addCase(getStoreByAdmin.rejected, (state, action) => {
        state.storeLoading = false;
        state.storeChecked = true;
        state.store = null;
        state.error = action.payload;
      })
      .addCase(getStoreByEmployee.fulfilled, (state, action) => {
        state.store = action.payload;
      })
      .addCase(getStoreEmployees.fulfilled, (state, action) => {
        state.employees = action.payload;
      })
      .addCase(addEmployee.fulfilled, (state, action) => {
        state.employees.push(action.payload);
      })
      .addCase(getStoreSubscription.fulfilled, (state, action) => {
        state.storeSubscription = action.payload;
      })

      // Update store in list after moderation
      .addCase(moderateStore.fulfilled, (state, action) => {
        const updated = action.payload;
        if (state.store && String(state.store.id) === String(updated?.id)) {
          state.store = { ...state.store, ...updated };
        }
        state.stores = state.stores.map(store =>
          String(store.id) === String(updated?.id) ? { ...store, ...updated } : store
        );
        if (state.searchPage && Array.isArray(state.searchPage.content)) {
          state.searchPage.content = state.searchPage.content.map(store =>
            String(store.id) === String(updated?.id) ? { ...store, ...updated } : store
          );
        }
      })

      .addMatcher(
        (action) => action.type.startsWith('store/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.error = action.payload;
        }
      );
  },
});

export const { setStore, clearStoreState } = storeSlice.actions;
export default storeSlice.reducer;
