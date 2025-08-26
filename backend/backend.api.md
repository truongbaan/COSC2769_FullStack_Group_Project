# Backend API Documentation

## Table of Contents

1. [Product Endpoints](#product-endpoints)
2. [Order Endpoints](#order-endpoints)
3. [Shopping Cart Endpoints](#shoppingcart-endpoints)

## Product Endpoints

### GET /products
Retrieve all available products with optional filters & pagination.

**Authentication**: 
- `Required`: (role: `customer`, `vendor`)
  
**Query Parameters (optional):**
- `page`: number (default 1, min 1)
- `size`: number (default 10, max 30)
- `category`: string | number (optional)
- `priceMin`: number (optional, min 0)
- `priceMax`: number (optional, max 100000000)
- `name`: string (optional, search by product name)
  
**Request:**
```
none
```
**Response:**
```json
{
  "success": true,
  "message": {
    "data": {
      "products": [
        {
            "id": "string",
            "vendor_id": "string",
            "name": "string",
            "price": number,
            "description": "string",
            "image": "string", // public URL
            "category": "string",
            "instock": boolean
        }
      ],
      "totalCount": 2
    }
  }
}
```
**Error Response:**
```json
{
  "success": false,
  "error": "string" // Error description
}
```
**Notes:**
- PriceMax needs to be larger than PriceMin.
- Image is returned as a public URL (Supabase Storage).

---
### GET /products/:productId
Retrieve a specific product by ID.

**Authentication**: 
- `Required`: (role: `customer`)

**Path Parameters::**
- `productId`: (string, required)

**Request:**
```
none
```
**Response:**
```json
{
  "success": true,
  "message": {
    "data": {
      "product": {
            "id": "string",
            "vendor_id": "string",
            "name": "string",
            "price": number,
            "description": "string",
            "image": "string",
            "category": "string",
            "instock": boolean
      }
            "totalCount": number
    }
  }
}
```
**Error Response:**
```json
{
  "success": false,
  "error": "string" // Error description
}
```
**Notes:**
- Image is returned as a public URL.

---
### POST /products
Create a new product. 

**Authentication**: 
- Required (role: `customer`)

**Request:** (multipart/ form-data)
- `name`: string (required)
- `price`: positive number (required)
- `description`: string (required)
- `category`: string (required)
- `instock`: boolean (optional)
- `image`: file (PNG/JPG) (required)

**Response:**
```json
{
  "success": true,
  "message": {
    "data": {
      "product": {
            "id": "string",
            "vendor_id": "string",
            "name": "string",
            "price": number,
            "description": "string",
            "image": "string", // public URL
            "category": "string",
            "instock": boolean
      }
    }
  }
}
```
**Error Response:**
```json
{
  "success": false,
  "error": "string" // Error description
}
```
**Notes:**`
- If `instock` is not provided, it is set to `false` by default.
- Image is stored as path in a bucket on Supabase.

---
### PATCH /products/:productId
Update an existing product.

**Authentication**: 
Required (role: `vendor`)

**Path Parameters::**
- `productId`: (string, required)

**Request:** (multipart/ form-data or JSON)
    
Any subset of:
- `name`: string (optional)
- `price`: positive number (optional)
- `description`: string (optional)
- `category`: string (optional)
- `instock`: boolean (optional)
- `image`: file (PNG/JPG) (optional)

**Response:**
```json
{
  "success": true,
  "message": {
    "message": "Update Status Success",
    "product": {
            "id": "string",
            "vendor_id": "string",
            "name": "string",
            "price": number,
            "description": "string",
            "image": "string", // public URL
            "category": "string",
            "instock": boolean
    }
  }
}
```
**Error Response:**
```json
{
  "success": false,
  "error": "string" // Error description
}
```
**Notes:**`
- Image is stored as path in a bucket on Supabase.
---