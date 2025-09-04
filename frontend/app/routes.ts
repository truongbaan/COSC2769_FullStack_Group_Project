/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Tran Hoang Linh
# ID: s4043097 */

import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  // Static pages
  route("about", "routes/about.tsx"),
  route("privacy", "routes/privacy.tsx"),
  route("help", "routes/help.tsx"),

  // Authentication
  route("login", "routes/auth/login.tsx"),
  // Single route handles base and role-specific tabs
  route("register/:role?", "routes/auth/register.tsx"),

  // Account
  route("account", "routes/account/profile.tsx"),

  // Customer routes
  route("products", "routes/customer/products.tsx"),
  route("products/:productId", "routes/customer/product-detail.tsx"),
  route("cart", "routes/customer/cart.tsx"),

  // Vendor routes
  route("vendor/products", "routes/vendor/products.tsx"),
  route("vendor/products/new", "routes/vendor/add-product.tsx"),

  // Shipper routes
  route("shipper/orders", "routes/shipper/orders.tsx"),
  route("shipper/orders/:orderId", "routes/shipper/order-detail.tsx"),
] satisfies RouteConfig;
