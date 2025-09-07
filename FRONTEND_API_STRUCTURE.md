# Frontend API Structure Documentation

**RMIT University Vietnam**  
**Course:** COSC2769 - Full Stack Development  
**Semester:** 2025B  
**Assessment:** Assignment 02  
**Author:** Tran Hoang Linh  
**ID:** s4043097

---

## Overview

This document describes the API structure used by the frontend application, including routes, parameters, request/response formats, and data schemas. The frontend communicates with a backend API server running on `http://localhost:5000/api`.

## Base Configuration

- **API Base URL:** `http://localhost:5000/api`
- **Authentication:** Cookie-based sessions with `credentials: "include"`
- **Content Type:** `application/json` (except for file uploads using `multipart/form-data`)
- **Error Handling:** Global 401 handler for session expiration

---

## Authentication APIs

### POST `/api/auth/login`

**Purpose:** User authentication  
**Access:** Public

**Request Body:**

```typescript
{
  email: string; // Valid email format
  password: string; // 8-20 chars, upper, lower, digit, special
}
```

**Response:**

```typescript
{
  success: boolean;
  message: {
    data: {
      user: {
        id: string;
        username: string;
        email: string;
        profile_picture: string | null;
        role: "customer" | "vendor" | "shipper";
        // Role-specific fields
        name?: string;                    // Customer
        address?: string;                 // Customer
        business_name?: string;           // Vendor
        business_address?: string;        // Vendor
        hub_id?: string;                 // Shipper
      }
    }
  }
}
```

### POST `/api/auth/register/customer`

**Purpose:** Customer registration  
**Access:** Public

**Request Body:**

```typescript
{
  email: string; // Valid email
  username: string; // 8-15 alphanumeric chars
  password: string; // Password requirements
  name: string; // Min 5 chars
  address: string; // Min 5 chars
}
```

**Response:**

```typescript
{
  success: boolean;
}
```

### POST `/api/auth/register/vendor`

**Purpose:** Vendor registration  
**Access:** Public

**Request Body:**

```typescript
{
  email: string;
  username: string;
  password: string;
  business_name: string; // Min 5 chars
  business_address: string; // Min 5 chars
}
```

**Response:**

```typescript
{
  success: boolean;
}
```

### POST `/api/auth/register/shipper`

**Purpose:** Shipper registration  
**Access:** Public

**Request Body:**

```typescript
{
  email: string;
  username: string;
  password: string;
  hub_id: string; // Selected distribution hub ID
}
```

**Response:**

```typescript
{
  success: boolean;
}
```

### POST `/api/auth/logout`

**Purpose:** User logout  
**Access:** Authenticated users

**Request Body:** Empty

**Response:**

```typescript
{
  success: boolean;
  message?: string;
}
```

---

## Product APIs

### GET `/api/products`

**Purpose:** Fetch products with filtering and pagination  
**Access:** Public

**Query Parameters:**

```typescript
{
  page?: number;        // Page number (default: 1)
  size?: number;        // Items per page (default: 12)
  category?: string;    // Product category filter
  priceMin?: number;    // Minimum price filter
  priceMax?: number;    // Maximum price filter
  name?: string;        // Product name search
}
```

**Response:**

```typescript
{
  success: boolean;
  message: {
    products: Array<{
      id: string;
      vendor_id: string;
      name: string;
      price: number;
      description: string;
      image: string | null;
      category: string;
      instock: boolean;
      // Frontend compatibility fields
      vendorId: string;
      vendorName: string;
      imageUrl: string;
      inStock: boolean;
      rating: number;
      reviewCount: number;
    }>;
    limit?: number;
    totalProducts?: number;
    totalPages?: number;
    currentPage?: number;
    count?: number;
  }
}
```

### GET `/api/products/{productId}`

**Purpose:** Fetch single product details  
**Access:** Public

**Path Parameters:**

- `productId`: string - Product ID

**Response:**

```typescript
{
  success: boolean;
  message: {
    product: {
      // Same structure as products array item
    }
  }
}
```

### GET `/api/products/vendorProducts`

**Purpose:** Fetch vendor's own products  
**Access:** Authenticated vendors only

**Query Parameters:** Same as `/api/products`

**Response:** Same structure as `/api/products`

### POST `/api/products`

**Purpose:** Create new product  
**Access:** Authenticated vendors only  
**Content-Type:** `multipart/form-data`

**Request Body (FormData):**

```typescript
{
  name: string; // 10-20 characters
  price: string; // Positive number as string
  description: string; // Max 500 characters
  category: string; // Valid category
  instock: string; // "true" or "false"
  image: File; // Image file
}
```

**Response:**

```typescript
{
  success: boolean;
  message: {
    product: any; // Created product object
  }
}
```

### PATCH `/api/products/{productId}`

**Purpose:** Update existing product  
**Access:** Authenticated vendors (own products only)  
**Content-Type:** `application/json` or `multipart/form-data`

**Path Parameters:**

- `productId`: string - Product ID

**Request Body (JSON - no image):**

```typescript
{
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  instock?: boolean;
}
```

**Request Body (FormData - with image):**

```typescript
{
  name?: string;
  price?: string;
  description?: string;
  category?: string;
  instock?: string;
  image: File;
}
```

**Response:**

```typescript
{
  success: boolean;
  message: {
    message?: string;
    product?: any;
  }
}
```

### POST `/api/products/{productId}/addToCart`

**Purpose:** Add product to cart  
**Access:** Authenticated customers only

**Path Parameters:**

- `productId`: string - Product ID

**Request Body:**

```typescript
{
  quantity?: number;    // Default: 1
}
```

**Response:**

```typescript
{
  success: boolean;
  message: {
    item: any; // Cart item object
  }
}
```

---

## Cart APIs

### GET `/api/cart`

**Purpose:** Fetch user's cart items  
**Access:** Authenticated customers only

**Query Parameters:**

```typescript
{
  page?: number;        // Page number
  size?: number;        // Items per page
}
```

**Response:**

```typescript
{
  success: boolean;
  message: {
    items: Array<{
      id: string; // Cart item ID
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
  }
}
```

### DELETE `/api/cart/removeItem/{productId}`

**Purpose:** Remove item from cart  
**Access:** Authenticated customers only

**Path Parameters:**

- `productId`: string - Product ID to remove

**Response:**

```typescript
{
  success: boolean;
  message: {
    data: {
      removed: boolean;
      id: string;
    }
  } | string;
}
```

### POST `/api/cart/checkout`

**Purpose:** Checkout cart and create order  
**Access:** Authenticated customers only

**Request Body:** Empty

**Response:**

```typescript
{
  success: boolean;
  message: {
    message: string;
    order: {
      id: string;
      hub_id: string;
      status: string;
      total_price: number;
    }
  }
}
```

---

## Order APIs

### GET `/api/orders`

**Purpose:** Fetch orders for shipper's hub  
**Access:** Authenticated shippers only

**Response:**

```typescript
{
  success: boolean;
  message: {
    data: {
      orders: Array<{
        id: string;
        customer_id: string;
        hub_id: string;
        status: string;
        total_price: number;
        // Frontend compatibility fields
        customerId: string;
        customerName: string;
        customerAddress: string;
        items: any[];
        total: number;
        hubId: string;
        hubName: string;
        orderDate: string;
        deliveryDate?: string;
        shipperId?: string;
      }>;
      count: number;
      page: number;
      size: number;
    }
  }
}
```

### GET `/api/orders/{orderId}`

**Purpose:** Fetch single order details  
**Access:** Authenticated users (role-based access)

**Path Parameters:**

- `orderId`: string - Order ID

**Response:**

```typescript
{
  // Order object structure (same as orders array item)
}
```

### GET `/api/orders/{orderId}/Items`

**Purpose:** Fetch order items with customer info  
**Access:** Authenticated shippers only

**Path Parameters:**

- `orderId`: string - Order ID

**Response:**

```typescript
{
  success: boolean;
  message: {
    order_id: string;
    customer: {
      name: string;
      address: string;
    }
    items: Array<{
      order_id: string;
      product_id: string;
      product_name: string;
      quantity: number;
      price_at_order_time: number;
      total: number;
      image: string;
    }>;
    count: number;
  }
}
```

### PATCH `/api/orders/{orderId}/status`

**Purpose:** Update order status  
**Access:** Authenticated shippers only

**Path Parameters:**

- `orderId`: string - Order ID

**Request Body:**

```typescript
{
  status: "delivered" | "canceled";
}
```

**Response:**

```typescript
{
  success: boolean;
  message?: {
    data: {
      order?: any;
    }
  }
}
```

---

## User Management APIs

### GET `/api/users`

**Purpose:** Fetch users list  
**Access:** Admin/Management access

**Query Parameters:**

```typescript
{
  page?: number;
  size?: number;
  role?: "customer" | "shipper" | "vendor" | "all";
}
```

**Response:**

```typescript
{
  success: boolean;
  message: {
    data: {
      users: any[];
      count: number;
    }
  }
}
```

### GET `/api/users/{userId}`

**Purpose:** Fetch user by ID  
**Access:** Authenticated users

**Path Parameters:**

- `userId`: string - User ID

**Response:**

```typescript
{
  success: boolean;
  message: {
    data: any; // User object
  }
}
```

### DELETE `/api/users/me`

**Purpose:** Delete current user account  
**Access:** Authenticated users

**Response:**

```typescript
{
  success: boolean;
  message: {
    message?: string;
  }
}
```

### PATCH `/api/users/update-password`

**Purpose:** Update user password  
**Access:** Authenticated users

**Request Body:**

```typescript
{
  password: string; // Current password
  newPassword: string; // New password (meets requirements)
}
```

**Response:**

```typescript
{
  success: boolean;
  message?: string;
}
```

### POST `/api/users/upload-image`

**Purpose:** Upload profile image  
**Access:** Authenticated users  
**Content-Type:** `multipart/form-data`

**Request Body (FormData):**

```typescript
{
  file: File; // Image file (max 2MB)
}
```

**Response:**

```typescript
{
  success: boolean;
  message?: string;     // Image URL
}
```

---

## Distribution Hub APIs

### GET `/api/distribution-hubs`

**Purpose:** Fetch distribution hubs list  
**Access:** Public (for registration)

**Query Parameters:**

```typescript
{
  page?: number;
  size?: number;
}
```

**Response:**

```typescript
{
  success: boolean;
  message: {
    data: {
      hubs: any[];
      count: number;
    }
  }
}
```

---

## Role-Specific APIs

### Vendor APIs

#### GET `/api/vendors`

**Purpose:** Fetch vendors list  
**Access:** Admin/Management

**Query Parameters:**

```typescript
{
  page?: number;
  size?: number;
}
```

**Response:**

```typescript
{
  success: boolean;
  message: {
    data: {
      vendors: any[];
      count: number;
    }
  }
}
```

### Customer APIs

#### GET `/api/customers`

**Purpose:** Fetch customers list  
**Access:** Admin/Management

**Query Parameters:**

```typescript
{
  page?: number;
  size?: number;
}
```

**Response:**

```typescript
{
  success: boolean;
  message: {
    data: {
      customers: any[];
      count: number;
    }
  }
}
```

### Shipper APIs

#### GET `/api/shippers`

**Purpose:** Fetch shippers list  
**Access:** Admin/Management

**Query Parameters:**

```typescript
{
  page?: number;
  size?: number;
}
```

**Response:**

```typescript
{
  success: boolean;
  message: {
    data: {
      shippers: any[];
      count: number;
    }
  }
}
```

---

## Data Schemas

### Product Categories

```typescript
const PRODUCT_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Beauty & Personal Care",
  "Home & Living",
  "Groceries & Essentials",
  "Sports & Outdoors",
  "Toys, Kids & Baby",
  "Automotive",
  "Books, Media & Entertainment",
  "Health & Wellness",
  "Office & Stationery",
  "Luxury & Premium",
] as const;
```

### Validation Rules

#### Username

- 8-15 characters
- Alphanumeric only (A-Z, a-z, 0-9)

#### Password

- 8-20 characters
- Must include: uppercase, lowercase, digit, special character (!@#$%^&\*)

#### Product Name

- 10-20 characters

#### Description

- Maximum 500 characters

#### Minimum Length Fields

- Name, Address, Business Name, Business Address: Minimum 5 characters

---

## Error Handling

### Global Error Handler

- **401 Unauthorized:** Triggers automatic logout and redirect
- **API Errors:** Formatted as `API {status}: {message}`
- **Validation Errors:** Zod schema validation with detailed messages

### Common Error Responses

```typescript
{
  success: false;
  message?: string;
  error?: string;
}
```

---

## Frontend State Management

### Redux Store Structure

#### Auth Slice

```typescript
interface AuthState {
  user: User | null;
}
```

#### Cart Slice

```typescript
interface CartState {
  items: CartItem[];
  isLoading: boolean;
  isSync: boolean;
  lastSynced?: string;
  error?: string;
}

interface CartItem {
  product: ProductDto;
  quantity: number;
  id?: string;
}
```

### API Integration Patterns

1. **Zod Validation:** All API responses validated with Zod schemas
2. **Error Boundaries:** Graceful error handling with user feedback
3. **Loading States:** UI feedback during API calls
4. **Optimistic Updates:** Immediate UI updates with rollback on failure
5. **Retry Logic:** Automatic retry for failed requests
6. **Cache Management:** Smart caching with invalidation strategies

---

## Security Features

1. **CSRF Protection:** Cookie-based authentication with secure headers
2. **Input Validation:** Client and server-side validation
3. **File Upload Security:** Type and size restrictions
4. **Session Management:** Automatic logout on session expiration
5. **Role-Based Access:** Route and API access control
6. **XSS Prevention:** Sanitized inputs and outputs

---

## Performance Optimizations

1. **Pagination:** All list APIs support pagination
2. **Lazy Loading:** Components loaded on demand
3. **Image Optimization:** Backend image serving with caching
4. **Bundle Splitting:** Code splitting for optimal loading
5. **Memoization:** React.memo and useMemo for expensive operations
6. **Debounced Search:** Reduced API calls for search functionality

---

_This documentation reflects the current frontend API integration as of the latest codebase analysis. For backend API specifications, refer to the backend documentation._
