import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ProductDto } from "../../schemas";
import { fetchCartApi } from "../../api";

export interface CartItem {
  product: ProductDto;
  quantity: number;
  id?: string; // Backend cart item ID for deletion
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  isSync: boolean;
  lastSynced?: string;
  error?: string;
}

const initialState: CartState = {
  items: [],
  isLoading: false,
  isSync: false,
  lastSynced: undefined,
  error: undefined,
};

// Async thunks for API calls - Updated to match backend API
export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  const response = await fetchCartApi();
  return response;
});

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (
      state,
      action: PayloadAction<{ product: ProductDto; quantity?: number }>
    ) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.product.id !== productId);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const { productId, quantity } = action.payload;

      if (quantity <= 0) {
        state.items = state.items.filter(
          (item) => item.product.id !== productId
        );
        return;
      }

      const item = state.items.find((item) => item.product.id === productId);
      if (item) {
        item.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.error = undefined;
    },
    setSyncStatus: (state, action: PayloadAction<boolean>) => {
      state.isSync = action.payload;
    },
    clearError: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart cases
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        // Transform backend cart items to frontend cart format
        state.items = action.payload.items.map((item) => ({
          id: item.id, // Store cart item ID for deletion
          product: {
            id: item.product_id,
            vendor_id: "",
            name: item.name,
            price: item.price,
            description: "",
            image: item.image || "",
            category: "",
            instock: true,
            // Frontend compatibility fields
            vendorId: "",
            vendorName: "Unknown Vendor",
            imageUrl: item.image || "",
            inStock: true,
            rating: 0,
            reviewCount: 0,
          },
          quantity: item.quantity,
        }));
        state.lastSynced = new Date().toISOString();
        state.isSync = true;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch cart";
      });
    // Note: Sync functionality removed - backend uses individual add/remove operations
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  setSyncStatus,
  clearError,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartLoading = (state: { cart: CartState }) =>
  state.cart.isLoading;
export const selectCartSync = (state: { cart: CartState }) => state.cart.isSync;
export const selectCartError = (state: { cart: CartState }) => state.cart.error;
export const selectCartLastSynced = (state: { cart: CartState }) =>
  state.cart.lastSynced;

export const selectTotalItems = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectTotalPrice = (state: { cart: CartState }) =>
  state.cart.items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

export default cartSlice.reducer;
