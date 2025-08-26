import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  fetchCart,
  setSyncStatus,
  clearError,
  selectCartItems,
  selectCartLoading,
  selectCartSync,
  selectCartError,
  selectCartLastSynced,
  selectTotalItems,
  selectTotalPrice,
  type CartItem,
} from "./slices/cartSlice";
import { selectUser } from "./slices/authSlice";
import type { ProductDto } from "../schemas";
import { toast } from "sonner";
import { addToCartApi, deleteCartItemApi } from "../api";

export const useCart = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const items = useAppSelector(selectCartItems);
  const isLoading = useAppSelector(selectCartLoading);
  const isSync = useAppSelector(selectCartSync);
  const error = useAppSelector(selectCartError);
  const lastSynced = useAppSelector(selectCartLastSynced);
  const totalItems = useAppSelector(selectTotalItems);
  const totalPrice = useAppSelector(selectTotalPrice);

  // Auto-sync cart when user logs in
  useEffect(() => {
    if (user && !isSync) {
      if (items.length === 0) {
        // No local items, fetch from server
        dispatch(fetchCart()).catch((error) => {
          console.error("Failed to fetch cart:", error);
        });
      } else {
        // Have local items without backend IDs, need to sync them to server
        const syncLocalItems = async () => {
          try {
            for (const item of items) {
              if (!item.id) {
                // Only sync items that don't have backend IDs
                await addToCartApi(item.product.id, item.quantity);
              }
            }
            // After syncing, fetch fresh cart data from server
            await dispatch(fetchCart()).unwrap();
          } catch (error) {
            console.error("Failed to sync local cart items:", error);
            dispatch(setSyncStatus(false));
          }
        };
        syncLocalItems();
      }
    }
  }, [user, isSync, dispatch, items]);

  const addItemToCart = useCallback(
    async (product: ProductDto, quantity: number = 1) => {
      // Add to local state first for immediate UI feedback
      dispatch(addItem({ product, quantity }));

      // If user is logged in, sync to backend
      if (user) {
        try {
          await addToCartApi(product.id, quantity);
          dispatch(setSyncStatus(true));
        } catch (error) {
          console.error("Failed to add item to backend cart:", error);
          toast.error("Failed to sync cart to server");
          // Keep the item in local state even if backend sync fails
          dispatch(setSyncStatus(false));
        }
      } else {
        // User not logged in, keep in local state only
        dispatch(setSyncStatus(false));
      }
    },
    [dispatch, user]
  );

  const removeItemFromCart = useCallback(
    async (productId: string) => {
      // Remove from local state first for immediate UI feedback
      dispatch(removeItem(productId));

      // If user is logged in, sync to backend
      if (user) {
        try {
          // Find the cart item to get its ID for backend deletion
          const cartItem = items.find((item) => item.product.id === productId);
          if (cartItem && cartItem.id) {
            await deleteCartItemApi(cartItem.id);
          }
          dispatch(setSyncStatus(true));
        } catch (error) {
          console.error("Failed to remove item from backend cart:", error);
          toast.error("Failed to sync cart to server");
          dispatch(setSyncStatus(false));
        }
      } else {
        dispatch(setSyncStatus(false));
      }
    },
    [dispatch, user, items]
  );

  const updateItemQuantity = useCallback(
    async (productId: string, quantity: number) => {
      dispatch(updateQuantity({ productId, quantity }));

      // Note: For quantity updates, we'd need an update cart item API
      // For now, just mark as not synced
      dispatch(setSyncStatus(false));
    },
    [dispatch]
  );

  const clearCartItems = useCallback(() => {
    dispatch(clearCart());
    // Note: For clearing cart, the backend handles this automatically after checkout
    dispatch(setSyncStatus(true));
  }, [dispatch]);

  const forceSync = useCallback(async () => {
    if (user) {
      try {
        // Sync local cart items TO backend
        let syncedItems = 0;
        for (const item of items) {
          if (!item.id) {
            // Only sync items that don't have backend IDs
            await addToCartApi(item.product.id, item.quantity);
            syncedItems++;
          }
        }

        // After syncing, fetch fresh cart data from server to get proper item IDs
        await dispatch(fetchCart()).unwrap();
        dispatch(setSyncStatus(true));

        if (syncedItems > 0) {
          toast.success(
            `Cart synced successfully - ${syncedItems} items synced to server`
          );
        } else {
          toast.success("Cart is already synced");
        }
      } catch (error) {
        console.error("Failed to sync cart:", error);
        toast.error("Failed to sync cart to server");
      }
    } else {
      toast.error("Please log in to sync your cart");
    }
  }, [user, dispatch, items]);

  const getTotalItems = useCallback(() => {
    return totalItems;
  }, [totalItems]);

  const getTotalPrice = useCallback(() => {
    return totalPrice;
  }, [totalPrice]);

  return {
    items,
    isLoading,
    isSync,
    error,
    lastSynced,
    addItem: addItemToCart,
    removeItem: removeItemFromCart,
    updateQuantity: updateItemQuantity,
    clearCart: clearCartItems,
    forceSync,
    getTotalItems,
    getTotalPrice,
  };
};
