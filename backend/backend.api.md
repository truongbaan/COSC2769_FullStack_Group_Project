# Backend API Documentation

## Table of Contents

1. [Product Endpoints](#product-endpoints)
2. [Order Endpoints](#order-endpoints)
3. [Shopping Cart Endpoints](#shoppingcart-endpoints)

## Product Endpoints
- Base path: `/api/products`

---
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
          "id": "f3d00277-dd78-4cba-8d35-cc5a25b6891d",
          "vendor_id": "d8a93cce-a277-4ef0-aa4e-73921d5b7732",
          "name": "Mot Mon Do Re Tien So 4",
          "price": 25000,
          "description": "Mon Do Nay Rat Rat Re Tien!",
          "image": "https://supabase.co/storage/v1/object/public/productimages/example.png",
          "category": "poor",
          "instock": false
        }
      ],
      "totalCount": 2
    }
  }
}
```
**Error Response:**
```json
{  }
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
          "image": "string", // public URL
          "category": "string",
          "instock": boolean    
      }
            "totalCount": number
    }
  }
}
```
Error Response (404):
**Error Response:**
```json
{  }
```
**Notes:**
- Image is returned as a public URL (Supabase Storage).

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
        "id": "c43b962e-da2b-4107-b63d-4a827b2bae53",
        "vendor_id": "d8a93cce-a277-4ef0-aa4e-73921d5b7732",
        "name": "Katy Perry vinyl boxset2",
        "price": 5000000,
        "description": "This is the 10th anni ones",
        "image": "https://supabase.co/storage/v1/object/public/productimages/41zu-8eZ80L.jpg",
        "category": "Vinyl Records",
        "instock": true
      }
    }
  }
}
```
**Error Response:**
```json
{  }
```
**Notes:**`
- If `instock` is not provided, it is set to `false` by default.
- Image is stored & returned as a public URL (Supabase Storage).

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
      "id": "0c88e05c-39ff-4d8f-a34e-1daba470ac5c",
      "vendor_id": "d8a93cce-a277-4ef0-aa4e-73921d5b7732",
      "name": "Teenage Dream vinyl",
      "price": 1500000,
      "description": "Another Katy Perry one",
      "image": "https://supabase.co/storage/v1/object/public/productimages/images.jpg",
      "category": "Vinyl Records",
      "instock": true
    }
  }
}
```
**Error Response:**
```json
{  }
```
**Notes:**`
- Image is stored & returned as a public URL (Supabase Storage).
---