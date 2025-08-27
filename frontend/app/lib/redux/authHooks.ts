import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  login,
  logout,
  selectUser,
  selectIsAuthenticated,
  type User,
} from "./slices/authSlice";
import { clearCart, setSyncStatus } from "./slices/cartSlice";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticatedValue = useAppSelector(selectIsAuthenticated);

  const loginUser = useCallback(
    (userData: User) => {
      dispatch(login(userData));
    },
    [dispatch]
  );

  const logoutUser = useCallback(() => {
    dispatch(logout());
    // Clear any locally persisted cart when logging out to avoid showing stale counts
    dispatch(clearCart());
    dispatch(setSyncStatus(false));
  }, [dispatch]);

  const isAuthenticated = useCallback(() => {
    return isAuthenticatedValue;
  }, [isAuthenticatedValue]);

  return {
    user,
    login: loginUser,
    logout: logoutUser,
    isAuthenticated,
  };
};
