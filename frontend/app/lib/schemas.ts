/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Tran Hoang Linh
# ID: s4043097 */

import { z } from "zod";

// Product schemas - Updated to match backend response
export const ProductSchema = z
  .object({
    id: z.string(),
    vendor_id: z.string(),
    name: z.string(),
    price: z.number(),
    description: z.string(),
    image: z.string().nullable(),
    category: z.string(),
    instock: z.boolean(),
    // Optional fields for frontend compatibility
    vendorId: z.string().optional(),
    vendorName: z.string().optional(),
    imageUrl: z.string().optional(),
    inStock: z.boolean().optional(),
    rating: z.number().optional(),
    reviewCount: z.number().optional(),
  })
  .transform((data) => ({
    // Backend fields
    id: data.id,
    vendor_id: data.vendor_id,
    name: data.name,
    price: data.price,
    description: data.description,
    image: data.image,
    category: data.category,
    instock: data.instock,
    // Frontend compatibility fields with defaults
    vendorId: data.vendor_id,
    vendorName: data.vendorName || "Unknown Vendor",
    imageUrl: data.image,
    inStock: data.instock,
    rating: data.rating || 4.0,
    reviewCount: data.reviewCount || 0,
  }));
export type ProductDto = z.infer<typeof ProductSchema>;
export const ProductsSchema = z.array(ProductSchema);

// API Response schema for products endpoint
export const ProductsApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.object({
    products: z.array(ProductSchema),
    // New paginated fields (backend update)
    limit: z.number().optional(),
    totalProducts: z.number().optional(),
    totalPages: z.number().optional(),
    currentPage: z.number().optional(),
    // Backwards compatibility field used by some endpoints
    count: z.number().optional(),
  }),
});

// API Response schema for single product endpoint
export const ProductApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.object({
    product: ProductSchema,
  }),
});

// Order schemas - Updated to match actual backend response
const OrderItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number(),
  price: z.number(),
});

// Backend only returns basic order data from database
export const OrderSchema = z
  .object({
    id: z.string(),
    customer_id: z.string(),
    hub_id: z.string(),
    status: z.string(), // Backend returns string, not enum
    total_price: z.number(),
  })
  .transform((data) => ({
    // Keep original backend fields
    id: data.id,
    customer_id: data.customer_id,
    hub_id: data.hub_id,
    status: data.status,
    total_price: data.total_price,
    // Add frontend compatibility fields with defaults
    customerId: data.customer_id,
    customerName: "Unknown Customer", // Backend doesn't provide this
    customerAddress: "Address not available", // Backend doesn't provide this
    items: [] as any[], // Backend doesn't provide order items
    total: data.total_price,
    hubId: data.hub_id,
    hubName: data.hub_id, // Use hub_id as fallback for display
    orderDate: new Date().toISOString(), // Backend doesn't provide this
    deliveryDate: undefined,
    shipperId: undefined,
  }));
export type OrderDto = z.infer<typeof OrderSchema>;
export const OrdersSchema = z.array(OrderSchema);

// Auth DTO (updated to match backend response structure)
export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  password: z.string().optional(), // Password is never returned in API responses
  profile_picture: z.string().nullable(),
  role: z.enum(["customer", "vendor", "shipper"]),
  // Customer-specific fields
  name: z.string().optional(),
  address: z.string().optional(),
  // Vendor-specific fields
  business_name: z.string().optional(),
  business_address: z.string().optional(),
  // Shipper-specific fields
  hub_id: z.string().optional(),
});

export const LoginSchema = z.object({
  success: z.boolean(),
  message: z.object({
    data: z.object({
      user: UserSchema,
    }),
  }),
});

export type LoginDto = z.infer<typeof LoginSchema>;
export type UserDto = z.infer<typeof UserSchema>;
