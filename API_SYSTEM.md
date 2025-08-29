## API System Overview

Base URL: `http://localhost:5000/api`

Authentication: Cookie-based sessions via `access_token` and `refresh_token` set by the auth endpoints. Many routes require authentication and specific roles.

Roles: `customer`, `vendor`, `shipper`.

---

## Conventions

- All responses follow `{ success: boolean, message?: string | object }` via helpers, with nested data in `message` or `data` depending on controller.
- Validation: Zod schemas validate query, params, and body. Errors return 400 with a message.
- Pagination: Many list endpoints accept `page` and `size`. If omitted, controllers may default or return full lists.

---

## Auth

### POST /auth/login

- Body:
  - `email: string` (valid email)
  - `password: string` (8–20, upper/lower/digit/special)
- Response 200:
  - Sets cookies `access_token`, `refresh_token`
  - `{ success: true, message: { data: { user } } }`

### POST /auth/register/customer

- Body:
  - `email, password, username, address, name`
- Response 200: sets cookies, returns `{ success: true, message: { data: { user } } }`

### POST /auth/register/shipper

- Body: `email, password, username, hub_id`
- Response 200: sets cookies, returns user

### POST /auth/register/vendor

- Body: `email, password, username, business_address, business_name`
- Response 200: sets cookies, returns user

### POST /auth/logout

- Clears cookies and returns `{ success: true, message: 'Logged out successfully' }`

---

## Users (auth required)

All under `/users` with `requireAuth()`.

### GET /users

- Query:
  - `page: number` (default -1)
  - `size: number` (default -1)
  - `role: 'customer' | 'shipper' | 'vendor' | 'all'` (default 'all')
- Response 200: `{ success: true, message: { data: { users, count } } }`

### GET /users/:id

- Params: `id: string`
- Response 200: `{ success: true, message: { data: user } }`

### DELETE /users/me

- Response 200: `{ success: true, message: { message: 'User account deleted successfully.' } }` and clears cookies

### PATCH /users/update-password

- Body:
  - `password?: string` (old)
  - `newPassword?: string`
- Both must be provided to change password
- Response 200: `{ success: true, message: 'Successfully update user <id>' }`

### POST /users/upload-image

- Multipart form-data: `file: File`
- Response 200: `{ success: true, message: '<imageUrl>' }`

---

## Products

### GET /products

- Query (all optional): `page, size, category, priceMin, priceMax, name`
- Response 200: `{ success: true, message: { products, limit, totalProducts, totalPages, currentPage } }`

### GET /products/vendorProducts (vendor only)

- Auth: `requireAuth('vendor')`
- Query: same as `/products`
- Response 200: same structure

### GET /products/:productId

- Params: `productId: string`
- Response 200: `{ success: true, message: { product } }`

### POST /products (vendor only)

- Auth: `requireAuth('vendor')`
- Multipart form-data:
  - `name: string`
  - `price: number`
  - `description: string`
  - `category: string`
  - `instock: boolean`
  - `image: File` (required)
- Response 201: `{ success: true, message: { product } }`

### PATCH /products/:productId (vendor only)

- Auth: `requireAuth('vendor')`
- Either:
  - JSON body (no image): any subset of `{ name, price, category, description, instock }`
  - Multipart form-data: any subset above plus `image: File`
- Response 200: `{ success: true, message: { product } }`

### POST /products/:productId/addToCart (customer only)

- Auth: `requireAuth('customer')`
- Body: `{ quantity?: number }` (default 1)
- Response 200: `{ success: true, message: { item } }`

---

## Shopping Cart (customer only)

All under `/cart` with `requireAuth('customer')`.

### GET /cart

- Query: `page, size` (default 1, 10)
- Response 200:
  - `{ success: true, message: { items: [{ id, product_id, name, quantity, price, subtotal, image }], count, page, size } }`

### DELETE /cart/removeItem/:id

- Params: `id: string` (cart item id)
- Response 200: `{ success: true, message: { data: { removed: boolean, id } } }`

### POST /cart/checkout

- Response 201: `{ success: true, message: { message: 'Checkout success', order: { id, hub_id, status, total_price } } }`

---

## Orders (shipper only)

All under `/orders` with `requireAuth('shipper')`.

### GET /orders

- Query: `page: number` (default 1), `size: number` (default 10)
- Response 200: `{ success: true, message: { data: { orders, count, page, size } } }`

### PATCH /orders/:id/status

- Params: `id: string`
- Body: `{ status: 'delivered' | 'canceled' }`
- Response 200: `{ success: true, message: { message: 'Order status updated', data: { order } } }`

### GET /orders/:id/items

- Params: `id: string` (order id)
- Response 200: `{ success: true, message: { order_id, customer: { name, address }, items: [...], count } }`

---

## Users by role (auth required)

These endpoints require authentication and are mounted with `requireAuth()` at top-level router.

### GET /vendors

### GET /customers

### GET /shippers

- Query: `page, size` (default -1 for unlimited)
- Response 200: `{ success: true, message: { data: { users, count } } }`

---

## Distribution Hubs (auth required)

### GET /distribution-hubs

- Query: `page: number` (default 1), `size: number` (default 10)
- Response 200: `{ success: true, message: { data: { hubs, count } } }`

---

## Frontend API helpers reference

Key wrappers live in `frontend/app/lib/api.ts` and perform:

- Zod validation of responses
- Automatic `credentials: 'include'`
- Global 401 handling via a logout handler

Examples:

- `fetchProducts`, `fetchVendorProducts`, `fetchProduct`
- `createProductApi`, `updateProductApi` (JSON for PATCH without file, FormData when image present)
- `addToCartApi`, `fetchCartApi`, `deleteCartItemApi`, `checkoutCartApi`
- `fetchOrdersByHub`, `updateOrderStatusApi`, `fetchOrderItemsApi`
- `registerCustomerApi`, `registerVendorApi`, `registerShipperApi`, `loginApi`, `logoutApi`
- `uploadProfileImageApi`, `fetchUsersApi`, `fetchUserByIdApi`, `deleteUserApi`, `updatePasswordApi`

---

## Notes

- Auth cookies are HttpOnly; ensure same-origin or proper CORS is configured.
- File uploads use multipart with `multer` in the backend and `FormData` in the frontend.
- For JSON PATCH updates (no files), send `Content-Type: application/json` (the frontend helper handles this automatically).
