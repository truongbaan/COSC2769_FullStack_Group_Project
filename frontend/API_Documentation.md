# Lazada E-Commerce API Documentation

This document outlines all the API endpoints available in the Lazada e-commerce system. Currently using mock endpoints under `/api-test/` prefix. The `/api/` prefix is reserved for future real backend integration.

## Base URL

- **Mock/Development**: `/api-test`
- **Production**: `/api` (reserved for future use)

## Authentication Endpoints

### POST /auth/login

Authenticate user credentials and return user information.

**Request:**

```json
{
  "email": "string", // valid email address
  "password": "string" // 8-20 chars with upper, lower, digit, special (!@#$%^&*)
}
```

**Response:**

```json
{
  "id": "string",
  "username": "string",
  "role": "customer" | "vendor" | "shipper",
  "name": "string",           // optional, for customers
  "businessName": "string",   // optional, for vendors
  "distributionHub": "string" // optional, for shippers
}
```

### POST /auth/register/customer

Register a new customer account.

**Request:**

```json
{
  "email": "string", // valid email address
  "username": "string", // 8-15 alphanumeric characters
  "password": "string", // 8-20 chars with upper, lower, digit, special
  "name": "string", // minimum 5 characters
  "address": "string", // minimum 5 characters
}
```

**Response:**

```json
{
  "success": true
}
```

### POST /auth/register/vendor

Register a new vendor account.

**Request:**

```json
{
  "email": "string", // valid email address
  "username": "string", // 8-15 alphanumeric characters
  "password": "string", // 8-20 chars with upper, lower, digit, special
  "businessName": "string", // minimum 5 characters
  "businessAddress": "string", // minimum 5 characters
}
```

**Response:**

```json
{
  "success": true
}
```

### POST /auth/register/shipper

Register a new shipper account.

**Request:**

```json
{
  "email": "string", // valid email address
  "username": "string", // 8-15 alphanumeric characters
  "password": "string", // 8-20 chars with upper, lower, digit, special
  "hub": "string", // distribution hub name (minimum 1 character)
}
```

**Response:**

```json
{
  "success": true
}

```

## Profile Endpoints

### POST /profile/upload-image

Upload a new profile image for the authenticated user.

**Request:**

- Content-Type: `multipart/form-data`
- Body: Form data with the following field:
  - `profileImage`: File (image file)

**File Requirements:**

- File must be an image (image/*)
- Maximum file size: 2MB
- Supported formats: PNG, JPG, JPEG, GIF, etc.

**Response:**

```json
{
  "success": true,
  "imageUrl": "string", // optional, URL to the uploaded image
  "message": "string"   // optional, success message
}
```

**Error Responses:**

```json
{
  "success": false,
  "error": "string" // Error description
}
```

**Common Error Cases:**

- `400`: No image file provided
- `400`: File must be an image
- `400`: File size must be less than 2MB
- `500`: Upload failed

## Cart Endpoints

### GET /cart?userId={userId}

Retrieve the cart for a specific user. Enables cart synchronization across devices.

**Query Parameters:**
- `userId` (required): User ID to fetch cart for

**Success Response:**

```json
{
  "success": true,
  "items": [
    {
      "product": {
        "id": "string",
        "name": "string",
        "price": number,
        "image": "string",       // optional
        "vendor": "string",
        "category": "string",
        "description": "string", // optional
        "rating": number,        // optional
        "reviews": number        // optional
      },
      "quantity": number
    }
  ],
  "lastUpdated": "string"      // ISO timestamp
}
```

**Error Responses:**

```json
{
  "success": false,
  "error": "string"            // error message
}
```

### POST /cart?userId={userId}

Sync the cart for a specific user. Updates the server-side cart with local changes.

**Query Parameters:**
- `userId` (required): User ID to sync cart for

**Request:**

```json
{
  "items": [
    {
      "product": {
        "id": "string",          // required
        "name": "string",        // required
        "price": number,         // required, positive
        "image": "string",       // optional
        "vendor": "string",      // required
        "category": "string",    // required
        "description": "string", // optional
        "rating": number,        // optional
        "reviews": number        // optional
      },
      "quantity": number         // required, positive
    }
  ]
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "string",         // success message
  "itemCount": number,         // number of items synced
  "lastUpdated": "string"      // ISO timestamp
}
```

**Error Responses:**

```json
{
  "success": false,
  "error": "string",           // error message
  "details": []                // validation details (for validation errors)
}
```

**Status Codes:**
- `200` - Cart synced successfully
- `400` - Invalid user ID or cart data
- `500` - Server error during sync

### Cart Synchronization Behavior

The cart API implements intelligent synchronization to provide seamless user experience across devices:

**Auto-Sync Logic:**
- When user logs in with **empty local cart**: Fetches cart from server
- When user logs in with **existing local cart**: Syncs local cart to server (preserves local data)
- All cart operations (add/remove/update) trigger **immediate sync** to server
- No debouncing or delays to prevent race conditions and data loss

**Data Persistence:**
- Cart data persists in browser localStorage via Redux Persist
- Server-side storage ensures cross-device synchronization
- Automatic error recovery with toast notifications

**Race Condition Prevention:**
- Synchronous cart operations prevent timing issues
- Smart fetch/sync logic prevents cart clearing
- Immediate sync ensures data consistency

**Error Handling:**
- Graceful fallback for offline usage
- Toast notifications for sync failures
- Automatic retry on network recovery

**Performance Considerations:**
- Optimistic UI updates for instant feedback
- Minimal API calls through intelligent sync logic
- Efficient state management with Redux Toolkit

### Cart API Usage Examples

**Adding an item to cart:**
```javascript
// Frontend automatically handles sync
const { addItem } = useCart();
addItem(product, quantity);
// → Dispatches Redux action
// → Updates local state immediately
// → Syncs to server automatically
// → Shows success toast
```

**Cross-device scenario:**
```
Device A: User adds items to cart
Device B: User logs in → Sees items from Device A
Device B: User adds more items
Device A: Refresh → Sees all items from both devices
```

### Troubleshooting

**Common Issues:**

1. **Cart appears empty after login**
   - Check network connectivity
   - Verify userId is passed correctly
   - Check browser localStorage permissions

2. **Items not syncing between devices**
   - Ensure user is logged in on both devices
   - Check API endpoint responses
   - Verify cart sync is not disabled

3. **Wrong items being added**
   - Verify product data integrity
   - Check for React closure issues
   - Ensure proper event handling

4. **Cart clearing unexpectedly**
   - Check for conflicting fetch/sync operations
   - Verify Redux state management
   - Monitor for race conditions

## Product Endpoints

### GET /products

Retrieve all available products.

**Request:** No parameters required.

**Response:**

```json
[
  {
    "id": "string",
    "name": "string",
    "price": number,
    "description": "string",
    "imageUrl": "string",     // valid URL
    "vendorId": "string",
    "vendorName": "string",
    "category": "string",
    "inStock": boolean,
    "rating": number,
    "reviewCount": number
  }
]
```

### GET /products/:productId

Retrieve a specific product by ID.

**Request:**

- Path parameter: `productId` (string)

**Response:**

```json
{
  "id": "string",
  "name": "string",
  "price": number,
  "description": "string",
  "imageUrl": "string",
  "vendorId": "string",
  "vendorName": "string",
  "category": "string",
  "inStock": boolean,
  "rating": number,
  "reviewCount": number
}
```

### GET /products/search

Search and filter products.

**Query Parameters:**

- `q` (string, optional): Search query
- `min` (number, optional): Minimum price
- `max` (number, optional): Maximum price
- `category` (string, optional): Product category

**Example:** `/products/search?q=laptop&min=500&max=2000&category=Electronics`

**Response:**

```json
[
  {
    "id": "string",
    "name": "string",
    "price": number,
    "description": "string",
    "imageUrl": "string",
    "vendorId": "string",
    "vendorName": "string",
    "category": "string",
    "inStock": boolean,
    "rating": number,
    "reviewCount": number
  }
]
```

### POST /vendor/products

Create a new product (vendor only).

**Request:**

```json
{
  "name": "string",        // 10-20 characters
  "price": number,         // positive number
  "description": "string", // maximum 500 characters
  "image": "File"          // optional file upload
}
```

**Response:**

```json
{
  "success": true,
  "id": "string" // optional, generated product ID
}
```

## Order Endpoints

### GET /orders

Retrieve orders, optionally filtered by distribution hub.

**Query Parameters:**

- `hub` (string, optional): Distribution hub name for filtering

**Example:** `/orders?hub=Hanoi`

**Response:**

```json
[
  {
    "id": "string",
    "customerId": "string",
    "customerName": "string",
    "customerAddress": "string",
    "items": [
      {
        "productId": "string",
        "productName": "string",
        "quantity": number,
        "price": number
      }
    ],
    "total": number,
    "status": "pending" | "active" | "delivered" | "cancelled",
    "hubId": "string",
    "hubName": "string",
    "orderDate": "string",      // ISO date string
    "deliveryDate": "string",   // optional, ISO date string
    "shipperId": "string"       // optional
  }
]
```

### GET /orders/:orderId

Retrieve a specific order by ID.

**Request:**

- Path parameter: `orderId` (string)

**Response:**

```json
{
  "id": "string",
  "customerId": "string",
  "customerName": "string",
  "customerAddress": "string",
  "items": [
    {
      "productId": "string",
      "productName": "string",
      "quantity": number,
      "price": number
    }
  ],
  "total": number,
  "status": "pending" | "active" | "delivered" | "cancelled",
  "hubId": "string",
  "hubName": "string",
  "orderDate": "string",
  "deliveryDate": "string",   // optional
  "shipperId": "string"       // optional
}
```

### POST /orders/:orderId/status

Update the status of an order (shipper only).

**Request:**

- Path parameter: `orderId` (string)
- Body:

```json
{
  "status": "delivered" | "cancelled"
}
```

**Response:**

```json
{
  "success": true
}
```

### POST /orders/checkout

Place a new order (customer only).

**Request:**

```json
{
  "items": [
    {
      "productId": "string",    // required, minimum 1 character
      "quantity": number,       // required, positive integer
      "price": number          // required, positive number
    }
  ],                          // required, minimum 1 item
  "total": number             // required, positive number, must match calculated total
}
```

**Success Response:**

```json
{
  "success": true,
  "orderId": "string",         // generated order ID
  "message": "string",         // success message
  "total": number,             // confirmed total amount
  "itemCount": number          // number of items in order
}
```

**Error Responses:**

```json
{
  "success": false,
  "error": "string",           // error message
  "details": []                // validation details (for validation errors)
}
```

## Error Responses

All endpoints may return error responses in the following format:

**Error Response:**

```json
{
  "error": "string" // Error message description
}
```

**Common HTTP Status Codes:**

- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `404`: Not Found
- `405`: Method Not Allowed
- `500`: Internal Server Error

## Authentication Requirements

Some endpoints require authentication:

- All `/vendor/*` endpoints require vendor authentication
- All `/profile/*` endpoints require user authentication (any role)
- All `/orders/*` endpoints (except GET for specific hub filtering) require appropriate role authentication
- `/orders/checkout` requires customer authentication
- `/orders/:orderId/status` requires shipper authentication
- **All `/cart/*` endpoints require user authentication (any role)**

**Cart Authentication Behavior:**
- Cart operations require a valid `userId` parameter
- Unauthenticated users can maintain local cart state
- Cart sync only works for authenticated users
- Cross-device synchronization requires login

## Validation Rules

### Email

- Must be a valid email address format
- Required for all authentication and registration endpoints

### Username

- 8-15 characters
- Alphanumeric only (A-Z, a-z, 0-9)
- Required for registration (display name)

### Password

- 8-20 characters
- Must include: uppercase letter, lowercase letter, digit, special character (!@#$%^&\*)

### Product Name

- 10-20 characters for vendor product creation

### General Text Fields

- Most descriptive fields require minimum 5 characters
- Product descriptions limited to 500 characters

### File Uploads

- Profile pictures can be uploaded via `/profile/upload-image` endpoint
- Product images optional for product creation
- All images must be under 2MB and valid image formats
- Supported formats: PNG, JPG, JPEG, GIF, and other standard image types

## Notes

- All API responses include proper JSON content-type headers
- Request bodies should be sent as JSON with `Content-Type: application/json`
- Login now uses email instead of username for authentication
- Registration forms collect both email (for auth) and username (for display)
- All schemas are validated using Zod on both client and server sides
- Mock endpoints simulate realistic delays and may return demo data

## Technical Implementation

### State Management
- **Redux Toolkit** for predictable state management
- **Redux Persist** for automatic localStorage persistence
- **React-Redux** hooks for component integration
- Centralized store with typed selectors and actions

### Cart Implementation
- Smart sync logic prevents data loss and race conditions
- Immediate synchronization for reliable operations
- SSR-compatible storage with graceful fallbacks
- Type-safe schemas ensure data integrity
- Optimistic updates for responsive user experience

### Error Handling
- Comprehensive error boundaries
- Toast notifications for user feedback
- Automatic retry mechanisms
- Graceful degradation for offline usage

### Performance Optimizations
- Memoized selectors prevent unnecessary re-renders
- Debounced UI updates where appropriate
- Efficient Redux store structure
- Minimal API calls through intelligent caching
