/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Tran Hoang Linh
# ID: s4043097 */

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
