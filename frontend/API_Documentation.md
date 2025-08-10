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
  "username": "string", // 8-15 alphanumeric characters
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
  "username": "string", // 8-15 alphanumeric characters
  "password": "string", // 8-20 chars with upper, lower, digit, special
  "name": "string", // minimum 5 characters
  "address": "string", // minimum 5 characters
  "profilePic": "File" // FileList with at least one file
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
  "username": "string", // 8-15 alphanumeric characters
  "password": "string", // 8-20 chars with upper, lower, digit, special
  "businessName": "string", // minimum 5 characters
  "businessAddress": "string", // minimum 5 characters
  "profilePic": "File" // FileList with at least one file
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
  "username": "string", // 8-15 alphanumeric characters
  "password": "string", // 8-20 chars with upper, lower, digit, special
  "hub": "string", // distribution hub name (minimum 1 character)
  "profilePic": "File" // FileList with at least one file
}
```

**Response:**

```json
{
  "success": true
}
```

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
      "productId": "string",
      "quantity": number,
      "price": number
    }
  ],
  "total": number
}
```

**Response:**

```json
{
  "success": true
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
- All `/orders/*` endpoints (except GET for specific hub filtering) require appropriate role authentication
- `/orders/checkout` requires customer authentication
- `/orders/:orderId/status` requires shipper authentication

## Validation Rules

### Username

- 8-15 characters
- Alphanumeric only (A-Z, a-z, 0-9)

### Password

- 8-20 characters
- Must include: uppercase letter, lowercase letter, digit, special character (!@#$%^&\*)

### Product Name

- 10-20 characters for vendor product creation

### General Text Fields

- Most descriptive fields require minimum 5 characters
- Product descriptions limited to 500 characters

### File Uploads

- Profile pictures required for all registration types
- Product images optional for product creation

## Notes

- All API responses include proper JSON content-type headers
- Request bodies should be sent as JSON with `Content-Type: application/json`
- File uploads use multipart/form-data (though current mock implementation doesn't process files)
- All schemas are validated using Zod on both client and server sides
- Mock endpoints simulate realistic delays and may return demo data
