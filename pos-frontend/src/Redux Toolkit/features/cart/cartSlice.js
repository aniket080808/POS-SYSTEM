import { createSlice } from "@reduxjs/toolkit";
import { logout } from "../user/userThunks";
import { endShift } from "../shiftReport/shiftReportThunks";

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem("pos_cart_items");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const loadHeldOrdersFromStorage = () => {
  try {
    const saved = localStorage.getItem("pos_held_orders");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items) => {
  try {
    localStorage.setItem("pos_cart_items", JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save cart to localStorage", e);
  }
};

const saveHeldOrdersToStorage = (heldOrders) => {
  try {
    localStorage.setItem("pos_held_orders", JSON.stringify(heldOrders));
  } catch (e) {
    console.error("Failed to save held orders to localStorage", e);
  }
};

const initialState = {
  items: loadCartFromStorage(),
  selectedCustomer: null,
  note: "",
  discount: { type: "percentage", value: 0 },
  paymentMethod: "CASH",
  heldOrders: loadHeldOrdersFromStorage(),
  currentOrder: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const existingItem = state.items.find((item) => item.id === product.id);

      if (existingItem) {
        if (product.stock !== undefined && product.stock !== null && existingItem.quantity >= product.stock) {
          return;
        }
        existingItem.quantity += 1;
      } else {
        if (product.stock !== undefined && product.stock !== null && product.stock <= 0) {
          return;
        }
        const productWithPrice = {
          ...product,
          quantity: 1,
        };
        state.items.push(productWithPrice);
      }
      saveCartToStorage(state.items);
    },

    updateCartItemQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item.id !== id);
      } else {
        const item = state.items.find((item) => item.id === id);
        if (item) {
          if (item.stock !== undefined && item.stock !== null && quantity > item.stock) {
            item.quantity = item.stock;
          } else {
            item.quantity = quantity;
          }
        }
      }
      saveCartToStorage(state.items);
    },

    removeFromCart: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((item) => item.id !== id);
      saveCartToStorage(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      state.selectedCustomer = null;
      state.note = "";
      state.discount = { type: "percentage", value: 0 };
      state.paymentMethod = "CASH";
      state.currentOrder = null;
      saveCartToStorage(state.items);
    },

    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },

    setNote: (state, action) => {
      state.note = action.payload;
    },

    setDiscount: (state, action) => {
      state.discount = action.payload;
    },

    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },

    holdOrder: (state) => {
      if (state.items.length > 0) {
        const heldOrder = {
          id: Date.now(),
          items: [...state.items],
          customer: state.selectedCustomer,
          note: state.note,
          discount: state.discount,
          timestamp: new Date(),
        };

        state.heldOrders.push(heldOrder);

        // Reset current order
        state.items = [];
        state.selectedCustomer = null;
        state.note = "";
        state.discount = { type: "percentage", value: 0 };

        saveCartToStorage(state.items);
        saveHeldOrdersToStorage(state.heldOrders);
      }
    },

    resumeOrder: (state, action) => {
      const order = action.payload;
      state.items = order.items || [];
      state.selectedCustomer = order.customer;
      state.note = order.note || "";
      state.discount = order.discount || { type: "percentage", value: 0 };

      // Remove from held orders
      state.heldOrders = state.heldOrders.filter((o) => o.id !== order.id);

      saveCartToStorage(state.items);
      saveHeldOrdersToStorage(state.heldOrders);
    },

    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },

    resetOrder: (state) => {
      state.items = [];
      state.selectedCustomer = null;
      state.note = "";
      state.discount = { type: "percentage", value: 0 };
      state.paymentMethod = "CASH";
      state.currentOrder = null;
      saveCartToStorage(state.items);
    },
  },
  extraReducers: (builder) => {
    const resetCartState = () => {
      try {
        localStorage.removeItem("pos_cart_items");
        localStorage.removeItem("pos_held_orders");
      } catch (e) {
        console.error("Failed to clear cart storage", e);
      }
      return {
        items: [],
        selectedCustomer: null,
        note: "",
        discount: { type: "percentage", value: 0 },
        paymentMethod: "CASH",
        heldOrders: [],
        currentOrder: null,
      };
    };

    builder
      .addCase(logout.fulfilled, resetCartState)
      .addCase(endShift.fulfilled, resetCartState)
      .addCase("auth/logout", resetCartState);
  },
});

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartItemCount = (state) => state.cart.items.length;
export const selectSelectedCustomer = (state) => state.cart.selectedCustomer;
export const selectNote = (state) => state.cart.note;
export const selectDiscount = (state) => state.cart.discount;
export const selectPaymentMethod = (state) => state.cart.paymentMethod;
export const selectHeldOrders = (state) => state.cart.heldOrders;
export const selectCurrentOrder = (state) => state.cart.currentOrder;

// Calculation selectors
export const selectSubtotal = (state) => {
  return (state.cart.items || []).reduce(
    (total, item) => {
      const price = item.sellingPrice !== undefined ? item.sellingPrice : (item.price || 0);
      const qty = item.quantity !== undefined ? item.quantity : 1;
      return total + (Number(price) || 0) * (Number(qty) || 0);
    },
    0
  );
};

export const selectTaxRate = (state) => {
  const rawTaxRate =
    state.store?.store?.taxRate ??
    state.branch?.branch?.store?.taxRate ??
    state.user?.userProfile?.store?.taxRate ??
    state.user?.userProfile?.branch?.store?.taxRate ??
    18;
  const taxRate = Number(rawTaxRate);
  return isNaN(taxRate) ? 18 : taxRate;
};

export const selectTax = (state) => {
  const subtotal = selectSubtotal(state);
  const taxRate = selectTaxRate(state);
  return subtotal * (taxRate / 100);
};

export const selectDiscountAmount = (state) => {
  const subtotal = selectSubtotal(state);
  const discount = state.cart.discount || { type: "percentage", value: 0 };
  const val = Number(discount.value) || 0;

  if (discount.type === "percentage") {
    return subtotal * (val / 100);
  } else {
    return Math.min(val, subtotal);
  }
};

export const selectTotal = (state) => {
  const subtotal = selectSubtotal(state);
  const tax = selectTax(state);
  const discountAmount = selectDiscountAmount(state);
  return Math.max(0, subtotal + tax - discountAmount);
};

export const {
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  setSelectedCustomer,
  setNote,
  setDiscount,
  setPaymentMethod,
  holdOrder,
  resumeOrder,
  setCurrentOrder,
  resetOrder,
} = cartSlice.actions;

export default cartSlice.reducer;
