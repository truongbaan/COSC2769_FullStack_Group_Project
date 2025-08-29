import { z } from "zod";
import {
  ProductSchema,
  ProductsSchema,
  ProductsApiResponseSchema,
  ProductApiResponseSchema,
  OrderSchema,
  OrdersSchema,
  LoginSchema,
  type ProductDto,
  type OrderDto,
  type LoginDto,
} from "~/lib/schemas";
import {
  customerRegistrationSchema,
  vendorRegistrationSchema,
  shipperRegistrationSchema,
  loginSchema,
  cartSyncSchema,
  cartResponseSchema,
  cartSyncResponseSchema,
} from "~/lib/validators";

// Global logout handler - will be set by the app root component
let globalLogoutHandler: (() => void) | null = null;

export function setGlobalLogoutHandler(handler: () => void) {
  globalLogoutHandler = handler;
}

export function clearGlobalLogoutHandler() {
  globalLogoutHandler = null;
}

// Mock cart storage (in a real app, this would be in a database)
const mockCartStorage = new Map<string, any[]>();

// Mock cart handlers
export function mockGetCart(userId: string) {
  const userCart = mockCartStorage.get(userId) || [];
  return {
    success: true,
    items: userCart,
    lastUpdated: new Date().toISOString(),
  };
}

export function mockSyncCart(userId: string, cartData: any) {
  // Validate cart data
  const validatedData = cartSyncSchema.parse(cartData);

  // Save cart to mock storage
  mockCartStorage.set(userId, validatedData.items);

  return {
    success: true,
    message: "Cart synced successfully",
    itemCount: validatedData.items.length,
    lastUpdated: new Date().toISOString(),
  };
}

// Shared fetch helper with zod parsing
async function request<T>(
  input: RequestInfo | URL,
  schema: z.ZodType<T>,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    credentials: "include", // Include cookies for authentication
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");

    // Handle 401 Unauthorized - only for authenticated user session expiration
    // Note: Login/register APIs use direct fetch to avoid triggering this on auth failures
    if (res.status === 401 && globalLogoutHandler) {
      // Call the global logout handler to logout user and redirect
      globalLogoutHandler();
    }

    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  const data = await res.json();
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
}

// API endpoints (local mock uses /api-test; /api reserved for real backend)
const API_BASE = "http://localhost:5000/api"; // you can swap to an env-based URL later

// Products - Updated to match backend
export async function fetchProducts(params?: {
  page?: number;
  size?: number;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  name?: string;
}): Promise<{
  products: ProductDto[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
}> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.size) qs.set("size", String(params.size));
  if (params?.category) qs.set("category", params.category);
  if (params?.priceMin !== undefined)
    qs.set("priceMin", String(params.priceMin));
  if (params?.priceMax !== undefined)
    qs.set("priceMax", String(params.priceMax));
  if (params?.name) qs.set("name", params.name);

  const url = `${API_BASE}/products${qs.toString() ? "?" + qs.toString() : ""}`;
  const response = await request(url, ProductsApiResponseSchema);
  return {
    products: response.message.products,
    currentPage: (response.message.currentPage ?? Number(qs.get("page"))) || 1,
    totalPages: response.message.totalPages ?? 1,
    totalProducts:
      response.message.totalProducts ?? response.message.count ?? 0,
    limit: (response.message.limit ?? Number(qs.get("size"))) || 12,
  };
}

// Removed paginated products listing; using fetchProducts instead

export async function fetchProduct(productId: string): Promise<ProductDto> {
  const response = await request(
    `${API_BASE}/products/${productId}`,
    ProductApiResponseSchema
  );
  return response.message.product;
}

// Vendor-specific products (authenticated vendor only)
export async function fetchVendorProducts(params?: {
  page?: number;
  size?: number;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  name?: string;
}): Promise<ProductDto[]> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.size) qs.set("size", String(params.size));
  if (params?.category) qs.set("category", params.category);
  if (params?.priceMin !== undefined)
    qs.set("priceMin", String(params.priceMin));
  if (params?.priceMax !== undefined)
    qs.set("priceMax", String(params.priceMax));
  if (params?.name) qs.set("name", params.name);

  const url = `${API_BASE}/products/vendorProducts${qs.toString() ? "?" + qs.toString() : ""}`;
  const response = await request(url, ProductsApiResponseSchema);
  return response.message.products;
}

// Search products is handled by fetchProducts with name parameter
export async function searchProductsApi(params: {
  q?: string;
  min?: number;
  max?: number;
  category?: string;
}): Promise<ProductDto[]> {
  // Map search params to backend format
  const result = await fetchProducts({
    name: params.q,
    priceMin: params.min,
    priceMax: params.max,
    category: params.category,
  });
  return result.products;
}

// Orders (Shipper) - Updated to match backend API
// Backend automatically determines hub from authenticated shipper's data
export async function fetchOrdersByHub(): Promise<OrderDto[]> {
  const response = await request(
    `${API_BASE}/orders`,
    z.object({
      success: z.boolean(),
      message: z.object({
        data: z.object({
          orders: OrdersSchema,
          count: z.number(),
          page: z.number(),
          size: z.number(),
        }),
      }),
    })
  );
  return response.message.data.orders;
}

export async function fetchOrder(orderId: string): Promise<OrderDto> {
  return request(`${API_BASE}/orders/${orderId}`, OrderSchema);
}

export async function updateOrderStatusApi(
  orderId: string,
  status: "delivered" | "canceled"
): Promise<{ success: boolean; order?: any }> {
  const response = await request(
    `${API_BASE}/orders/${orderId}/status`,
    z.object({
      success: z.boolean(),
      message: z
        .object({
          data: z.object({
            order: z.any().optional(),
          }),
        })
        .optional(),
    }),
    { method: "PATCH", body: JSON.stringify({ status }) }
  );
  return {
    success: response.success,
    order: response.message?.data?.order,
  };
}

// Auth
export async function loginApi(
  credentials: z.infer<typeof loginSchema>
): Promise<LoginDto> {
  // Use direct fetch for login to avoid triggering global logout handler on failed login (401)
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // Don't trigger global logout handler for login failures
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  const data = await res.json();
  const parsed = LoginSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
}
// Fix customer registration
export async function registerCustomerApi(
  data: z.infer<typeof customerRegistrationSchema>
): Promise<{ success: boolean }> {
  // Transform field names to match backend expectations
  const transformedData = {
    email: data.email,
    username: data.username,
    password: data.password,
    name: data.name,
    address: data.address,
  };

  // Use direct fetch to avoid triggering global logout handler on registration failures
  const res = await fetch(`${API_BASE}/auth/register/customer`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transformedData),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  const data_response = await res.json();
  const parsed = z.object({ success: z.boolean() }).safeParse(data_response);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
}

// Fix vendor registration
export async function registerVendorApi(
  data: z.infer<typeof vendorRegistrationSchema>
): Promise<{ success: boolean }> {
  // Transform field names to match backend expectations
  const transformedData = {
    email: data.email,
    username: data.username,
    password: data.password,
    business_name: data.businessName, // camelCase → snake_case
    business_address: data.businessAddress, // camelCase → snake_case
  };

  // Use direct fetch to avoid triggering global logout handler on registration failures
  const res = await fetch(`${API_BASE}/auth/register/vendor`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transformedData),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  const data_response = await res.json();
  const parsed = z.object({ success: z.boolean() }).safeParse(data_response);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
}

// Fix shipper registration
export async function registerShipperApi(
  data: z.infer<typeof shipperRegistrationSchema>
): Promise<{ success: boolean }> {
  // Transform field names to match backend expectations
  const transformedData = {
    email: data.email,
    username: data.username,
    password: data.password,
    hub_id: data.hub, // hub → hub_id
  };

  // Use direct fetch to avoid triggering global logout handler on registration failures
  const res = await fetch(`${API_BASE}/auth/register/shipper`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transformedData),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  const data_response = await res.json();
  const parsed = z.object({ success: z.boolean() }).safeParse(data_response);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
}

// Vendor - create product (updated to match backend)
export async function createProductApi(data: {
  name: string;
  price: number;
  description: string;
  category: string;
  instock: boolean;
  image: File;
}): Promise<{ success: boolean; product?: any }> {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("price", String(data.price));
  formData.append("description", data.description);
  formData.append("category", data.category);
  formData.append("instock", String(data.instock));
  formData.append("image", data.image);

  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  const responseData = await res.json();
  const parsed = z
    .object({
      success: z.boolean(),
      message: z.object({
        product: z.any(),
      }),
    })
    .safeParse(responseData);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return {
    success: parsed.data.success,
    product: parsed.data.message.product,
  };
}

// Note: Backend doesn't have delete product endpoint, only update status

// Update vendor product - matches backend PATCH endpoint
export async function updateProductApi(
  productId: string,
  productData: {
    name?: string;
    price?: number;
    description?: string;
    category?: string;
    instock?: boolean;
    image?: File;
  }
): Promise<{
  success: boolean;
  message?: string;
  product?: any;
}> {
  // When no file upload is needed, send JSON body for PATCH updates
  if (!productData.image) {
    const jsonBody: Record<string, unknown> = {};
    if (productData.name !== undefined) jsonBody.name = productData.name;
    if (productData.price !== undefined) jsonBody.price = productData.price;
    if (productData.description !== undefined)
      jsonBody.description = productData.description;
    if (productData.category !== undefined)
      jsonBody.category = productData.category;
    if (productData.instock !== undefined)
      jsonBody.instock = productData.instock;

    const response = await request(
      `${API_BASE}/products/${productId}`,
      z.object({
        success: z.boolean(),
        message: z.object({
          message: z.string().optional(),
          product: z.any().optional(),
        }),
      }),
      { method: "PATCH", body: JSON.stringify(jsonBody) }
    );

    return {
      success: response.success,
      message: response.message.message,
      product: response.message.product,
    };
  }

  // If an image file is provided, fall back to multipart/form-data
  const formData = new FormData();
  if (productData.name !== undefined) formData.append("name", productData.name);
  if (productData.price !== undefined)
    formData.append("price", String(productData.price));
  if (productData.description !== undefined)
    formData.append("description", productData.description);
  if (productData.category !== undefined)
    formData.append("category", productData.category);
  if (productData.instock !== undefined)
    formData.append("instock", String(productData.instock));
  formData.append("image", productData.image);

  const res = await fetch(`${API_BASE}/products/${productId}`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  const responseData = await res.json();
  const parsed = z
    .object({
      success: z.boolean(),
      message: z.object({
        message: z.string().optional(),
        product: z.any().optional(),
      }),
    })
    .safeParse(responseData);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return {
    success: parsed.data.success,
    message: parsed.data.message.message,
    product: parsed.data.message.product,
  };
}

// Checkout - Updated to match backend cart checkout endpoint
export async function checkoutCartApi(): Promise<{
  success: boolean;
  order?: {
    id: string;
    hub_id: string;
    status: string;
    total_price: number;
  };
  message: string;
}> {
  return request(
    `${API_BASE}/cart/checkout`,
    z.object({
      success: z.boolean(),
      message: z.object({
        message: z.string(),
        order: z.object({
          id: z.string(),
          hub_id: z.string(),
          status: z.string(),
          total_price: z.number(),
        }),
      }),
    }),
    { method: "POST" }
  ).then((response) => ({
    success: response.success,
    order: response.message.order,
    message: response.message.message,
  }));
}

// Add product to cart - new function based on backend
export async function addToCartApi(
  productId: string,
  quantity: number = 1
): Promise<{
  success: boolean;
  item: any;
}> {
  return request(
    `${API_BASE}/products/${productId}/addToCart`,
    z.object({
      success: z.boolean(),
      message: z.object({
        item: z.any(),
      }),
    }),
    { method: "POST", body: JSON.stringify({ quantity }) }
  ).then((response) => ({
    success: response.success,
    item: response.message.item,
  }));
}

// Profile image upload - Updated to match backend
export async function uploadProfileImageApi(file: File): Promise<{
  success: boolean;
  imageUrl?: string;
}> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/users/upload-image`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  const data = await res.json();
  const parsed = z
    .object({
      success: z.boolean(),
      message: z.string().optional(),
    })
    .safeParse(data);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return {
    success: parsed.data.success,
    imageUrl: parsed.data.message,
  };
}

// Cart API functions - Updated to match backend API
export async function fetchCartApi(params?: {
  page?: number;
  size?: number;
}): Promise<{
  success: boolean;
  items: Array<{
    id: string;
    product_id: string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    image: string | null;
  }>;
  count: number;
  page: number;
  size: number;
}> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.size) qs.set("size", String(params.size));

  const url = `${API_BASE}/cart${qs.toString() ? "?" + qs.toString() : ""}`;
  const response = await request(
    url,
    z.object({
      success: z.boolean(),
      message: z.object({
        items: z.array(
          z.object({
            id: z.string(),
            product_id: z.string(),
            name: z.string(),
            quantity: z.number(),
            price: z.number(),
            subtotal: z.number(),
            image: z.string().nullable(),
          })
        ),
        count: z.number(),
        page: z.number(),
        size: z.number(),
      }),
    }),
    { method: "GET" }
  );
  return {
    success: response.success,
    items: response.message.items,
    count: response.message.count,
    page: response.message.page,
    size: response.message.size,
  };
}

// Delete cart item by ID - Based on backend API
export async function deleteCartItemApi(productId: string): Promise<{
  success: boolean;
  removed?: boolean;
  id?: string;
}> {
  const response = await request(
    `${API_BASE}/cart/removeItem/${productId}`,
    z.object({
      success: z.boolean(),
      message: z.union([
        // Success response: nested data object
        z.object({
          data: z.object({
            removed: z.boolean(),
            id: z.string(),
          }),
        }),
        // Error response: string message
        z.string(),
      ]),
    }),
    { method: "DELETE" }
  );

  if (response.success && typeof response.message === "object") {
    return {
      success: response.success,
      removed: response.message.data.removed,
      id: response.message.data.id,
    };
  } else {
    return {
      success: response.success,
    };
  }
}

// Logout API - Added to match backend
export async function logoutApi(): Promise<{
  success: boolean;
  message?: string;
}> {
  // Use direct fetch to avoid triggering global logout handler on 401
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    // Don't trigger global logout handler for logout API calls
    // Just return a basic response indicating failure
    return {
      success: false,
      message: `Logout failed: ${res.status}`,
    };
  }

  const data = await res.json();
  const parsed = z
    .object({
      success: z.boolean(),
      message: z.string().optional(),
    })
    .safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid logout response",
    };
  }

  return parsed.data;
}

// Distribution Hubs API - Added to match backend
export async function fetchDistributionHubsApi(params?: {
  page?: number;
  size?: number;
}): Promise<any[]> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.size) qs.set("size", String(params.size));

  const url = `${API_BASE}/distribution-hubs${qs.toString() ? "?" + qs.toString() : ""}`;
  const response = await request(
    url,
    z.object({
      success: z.boolean(),
      message: z.object({
        data: z.object({
          hubs: z.array(z.any()),
          count: z.number(),
        }),
      }),
    })
  );
  return response.message.data.hubs;
}

// User Management APIs - Added to match backend
export async function fetchUsersApi(params?: {
  page?: number;
  size?: number;
  role?: "customer" | "shipper" | "vendor" | "all";
}): Promise<any[]> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.size) qs.set("size", String(params.size));
  if (params?.role) qs.set("role", params.role);

  const url = `${API_BASE}/users${qs.toString() ? "?" + qs.toString() : ""}`;
  const response = await request(
    url,
    z.object({
      success: z.boolean(),
      message: z.object({
        data: z.object({
          users: z.array(z.any()),
          count: z.number(),
        }),
      }),
    })
  );
  return response.message.data.users;
}

export async function fetchUserByIdApi(userId: string): Promise<any> {
  const response = await request(
    `${API_BASE}/users/${userId}`,
    z.object({
      success: z.boolean(),
      message: z.object({
        data: z.any(),
      }),
    })
  );
  return response.message.data;
}

export async function deleteUserApi(): Promise<{
  success: boolean;
  message?: string;
}> {
  return request(
    `${API_BASE}/users/me`,
    z.object({
      success: z.boolean(),
      message: z.object({
        message: z.string().optional(),
      }),
    }),
    { method: "DELETE" }
  ).then((response) => ({
    success: response.success,
    message: response.message.message,
  }));
}

export async function updatePasswordApi(data: {
  password: string;
  newPassword: string;
}): Promise<{ success: boolean; message?: string }> {
  return request(
    `${API_BASE}/users/update-password`,
    z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }),
    { method: "PATCH", body: JSON.stringify(data) }
  );
}

// Order Items Schema - Updated to match backend response
const OrderItemDetailSchema = z.object({
  order_id: z.string(),
  product_id: z.string(),
  product_name: z.string(),
  quantity: z.number(),
  price_at_order_time: z.number(),
  total: z.number(),
  image: z.string(),
});

const OrderItemsResponseSchema = z.object({
  success: z.boolean(),
  message: z.object({
    order_id: z.string(),
    customer: z.object({
      name: z.string(),
      address: z.string(),
    }),
    items: z.array(OrderItemDetailSchema),
    count: z.number(),
  }),
});

export type OrderItemDetail = z.infer<typeof OrderItemDetailSchema>;
export type OrderItemsResponse = z.infer<typeof OrderItemsResponseSchema>;

// Get order items - Updated to match backend response structure
export async function fetchOrderItemsApi(
  orderId: string
): Promise<OrderItemsResponse["message"]> {
  const response = await request(
    `${API_BASE}/orders/${orderId}/Items`,
    OrderItemsResponseSchema
  );
  return response.message;
}

// Get vendors, customers, shippers lists - Added to match backend
export async function fetchVendorsApi(params?: {
  page?: number;
  size?: number;
}): Promise<any[]> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.size) qs.set("size", String(params.size));

  const url = `${API_BASE}/vendors${qs.toString() ? "?" + qs.toString() : ""}`;
  const response = await request(
    url,
    z.object({
      success: z.boolean(),
      message: z.object({
        data: z.object({
          vendors: z.array(z.any()),
          count: z.number(),
        }),
      }),
    })
  );
  return response.message.data.vendors;
}

export async function fetchCustomersApi(params?: {
  page?: number;
  size?: number;
}): Promise<any[]> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.size) qs.set("size", String(params.size));

  const url = `${API_BASE}/customers${qs.toString() ? "?" + qs.toString() : ""}`;
  const response = await request(
    url,
    z.object({
      success: z.boolean(),
      message: z.object({
        data: z.object({
          customers: z.array(z.any()),
          count: z.number(),
        }),
      }),
    })
  );
  return response.message.data.customers;
}

export async function fetchShippersApi(params?: {
  page?: number;
  size?: number;
}): Promise<any[]> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.size) qs.set("size", String(params.size));

  const url = `${API_BASE}/shippers${qs.toString() ? "?" + qs.toString() : ""}`;
  const response = await request(
    url,
    z.object({
      success: z.boolean(),
      message: z.object({
        data: z.object({
          shippers: z.array(z.any()),
          count: z.number(),
        }),
      }),
    })
  );
  return response.message.data.shippers;
}
