/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Tran Hoang Linh
# ID: s4043097 */

// Re-export the Redux cart hooks and types for easy migration
export { useCart } from './redux/cartHooks';
export type { CartItem } from './redux/slices/cartSlice';