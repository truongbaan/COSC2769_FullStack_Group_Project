import { z } from "zod";

// Product schemas
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  description: z.string(),
  imageUrl: z.string().url(),
  vendorId: z.string(),
  vendorName: z.string(),
  category: z.string(),
  inStock: z.boolean(),
  rating: z.number(),
  reviewCount: z.number(),
});
export type ProductDto = z.infer<typeof ProductSchema>;
export const ProductsSchema = z.array(ProductSchema);

// Order schemas
const OrderItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number(),
  price: z.number(),
});
export const OrderSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  customerAddress: z.string(),
  items: z.array(OrderItemSchema),
  total: z.number(),
  status: z.enum(["pending", "active", "delivered", "cancelled"]),
  hubId: z.string(),
  hubName: z.string(),
  orderDate: z.string(),
  deliveryDate: z.string().optional(),
  shipperId: z.string().optional(),
});
export type OrderDto = z.infer<typeof OrderSchema>;
export const OrdersSchema = z.array(OrderSchema);

// Auth DTO (updated to match backend response structure)
export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
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
