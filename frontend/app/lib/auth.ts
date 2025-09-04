/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Tran Hoang Linh
# ID: s4043097 */

// Re-export the Redux auth hooks and types for easy migration
export { useAuth } from './redux/authHooks';
export type { User } from './redux/slices/authSlice';