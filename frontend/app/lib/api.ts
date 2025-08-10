import { z } from "zod";
import {
  ProductSchema,
  ProductsSchema,
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
} from "~/lib/validators";

// Shared fetch helper with zod parsing
async function request<T>(
  input: RequestInfo | URL,
  schema: z.ZodType<T>,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
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
const API_BASE = "/api-test"; // you can swap to an env-based URL later

// Products
export async function fetchProducts(): Promise<ProductDto[]> {
  return request(`${API_BASE}/products`, ProductsSchema);
}

export async function fetchProduct(productId: string): Promise<ProductDto> {
  return request(`${API_BASE}/products/${productId}`, ProductSchema);
}

export async function searchProductsApi(params: {
  q?: string;
  min?: number;
  max?: number;
  category?: string;
}): Promise<ProductDto[]> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.min !== undefined) qs.set("min", String(params.min));
  if (params.max !== undefined) qs.set("max", String(params.max));
  if (params.category) qs.set("category", params.category);
  return request(
    `${API_BASE}/products/search?${qs.toString()}`,
    ProductsSchema
  );
}

// Orders (Shipper)
export async function fetchOrdersByHub(hubName: string): Promise<OrderDto[]> {
  return request(
    `${API_BASE}/orders?hub=${encodeURIComponent(hubName)}`,
    OrdersSchema
  );
}

export async function fetchOrder(orderId: string): Promise<OrderDto> {
  return request(`${API_BASE}/orders/${orderId}`, OrderSchema);
}

export async function updateOrderStatusApi(
  orderId: string,
  status: "delivered" | "cancelled"
): Promise<{ success: boolean }> {
  return request(
    `${API_BASE}/orders/${orderId}/status`,
    z.object({ success: z.boolean() }),
    { method: "POST", body: JSON.stringify({ status }) }
  );
}

// Auth
export async function loginApi(
  credentials: z.infer<typeof loginSchema>
): Promise<LoginDto> {
  return request(`${API_BASE}/auth/login`, LoginSchema, {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function registerCustomerApi(
  data: z.infer<typeof customerRegistrationSchema>
): Promise<{ success: boolean }> {
  return request(
    `${API_BASE}/auth/register/customer`,
    z.object({ success: z.boolean() }),
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function registerVendorApi(
  data: z.infer<typeof vendorRegistrationSchema>
): Promise<{ success: boolean }> {
  return request(
    `${API_BASE}/auth/register/vendor`,
    z.object({ success: z.boolean() }),
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function registerShipperApi(
  data: z.infer<typeof shipperRegistrationSchema>
): Promise<{ success: boolean }> {
  return request(
    `${API_BASE}/auth/register/shipper`,
    z.object({ success: z.boolean() }),
    { method: "POST", body: JSON.stringify(data) }
  );
}

// Vendor - create product (demo)
export async function createProductApi(data: {
  name: string;
  price: number;
  description: string;
  image?: File | null;
}): Promise<{ success: boolean; id?: string }> {
  return request(
    `${API_BASE}/vendor/products`,
    z.object({ success: z.boolean(), id: z.string().optional() }),
    { method: "POST", body: JSON.stringify({ ...data, image: undefined }) }
  );
}

// Checkout (demo)
export async function placeOrderApi(payload: {
  items: Array<{ productId: string; quantity: number; price: number }>;
  total: number;
}): Promise<{ success: boolean }> {
  return request(
    `${API_BASE}/orders/checkout`,
    z.object({ success: z.boolean() }),
    { method: "POST", body: JSON.stringify(payload) }
  );
}
