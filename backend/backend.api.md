# API Endpoints

## Table Content
### Authentication Endpoints
* [POST /auth/login](#post-authlogin)
* [POST /auth/register/customer](#post-authregistercustomer)
* [POST /auth/register/vendor](#post-authregistervendor)
* [POST /auth/register/shipper](#post-authregistershipper)
---
### Users Endpoints
* [GET /users](#get-users)
* [GET /users/:id](#get-users:id)
* [DELETE /users/me](#delete-usersme)
* [PATCH /users/update-password](#patch-usersupdate-password)
* [POST /users/upload-image](#post-usersupload-image)
---
### Orders Endpoints
* [GET /orders](#get-apiorders)
* [PATCH /orders/:id/status](#put-apiorders:idstatus)
* [GET /orders/:id/Items](#get-apiorder:iditems)
---
### Shopping Carts Endpoints
* [GET /cart](#get-apicart)
* [DELETE /cart/removeItem/:id](#delete-deleteitem:id)
* [POST /cart/checkout](#post-apicartcheckout)
---
### Products Endpoints
* [GET /products](#get-apiproducts)
* [GET /products/:productId](#get-apiproducts:productid)
* [PATCH /products/:productId](#patch-apiproduct:productid)
* [POST /products/](#post-apiproducts)
* [POST /products/:id/addToCart](#post-product:idaddtocart)
---
## Authentication Endpoints

### POST /auth/login

- Description: Authenticate user credentials and return user information with role-specific data.

- **Request:**

  ```json
  {
    "email": "string", // valid email address
    "password": "string" // 8-20 chars with upper, lower, digit, special (!@#$%^&*)
  }
  ```

- **Response:**

  ```json
  {
    "id": "string",
    "username": "string",
    "role": "customer" | "vendor" | "shipper",
    "email": "string",
    "profile_picture": "string" // could put directly in img tag to display image
    "name": "string",           // optional, for customers
    "address": "string",          // optional, for customers
    "business_name": "string",   // optional, for vendors  
    "business_address": "string", // optional, for vendors
    "distributionHub": "string" // optional, for shippers
  }
  ```

- **Error Response:**

  ```json
  {
    "success": false,
    "error": "string" // Error description
  }
  ```

**Notes:**
- Returns user data based on stored registration information
- Shippers get their selected distribution hub from registration
- Vendors get their business name and business address from registration
- Customers get their name and address from registration

### POST /auth/register/customer

- **Description**: Register a new customer account.

- **Request:**

  ```json
  {
    "email": "string", // valid email address
    "username": "string", // 8-15 alphanumeric characters
    "password": "string", // 8-20 chars with upper, lower, digit, special
    "name": "string",
    "address": "string"
  }
  ```

- **Response:**

  ```json
  {
      "success": true,
      "message": {
          "data": {
              "user": {
                  "username": "string",
                  "profile_picture": "",
                  "role": "customer",
                  "id": "string",
                  "password": "hash password(string)",
                  "email": "string",
                  "address": "string",
                  "name": "string"
              }
          }
      }
  }
  ```

- **Error Response:**

  ```json
  {
    "success": false,
    "error": "string" // Error description
  }
  ```

### POST /auth/register/vendor

- **Description**: Register a new vendor account.

- **Request:**

  ```json
  {
    "email": "string", // valid email address
    "username": "string", // 8-15 alphanumeric characters
    "password": "string", // 8-20 chars with upper, lower, digit, special
    "business_name": "string",
    "business_address": "string"
  }
  ```

- **Response:**

  ```json
  {
      "success": true,
      "message": {
          "data": {
              "user": {
                  "username": "string",
                  "profile_picture": "",
                  "role": "vendor",
                  "id": "string",
                  "password": "hash password(string)",
                  "email": "string",
                  "business_name": "bisu name",
                  "business_address": "address of the bisu"
              }
          }
      }
  }
  ```
- **Error Response:**

  ```json
  {
    "success": false,
    "error": "string" // Error description
  }
  ```

### POST /auth/register/shipper

- **Description**: Register a new shipper account with distribution hub selection.

- **Request:**

  ```json
  {
    "email": "string", // valid email address
    "username": "string", // 8-15 alphanumeric characters
    "password": "string", // 8-20 chars with upper, lower, digit, special
    "hub_id": "string" // distribution hub id
  }
  ```

- **Response:**

  ```json
  {
      "success": true,
      "message": {
          "data": {
              "user": {
                  "username": "string",
                  "profile_picture": "",
                  "role": "vendor",
                  "id": "string",
                  "password": "hash password(string)",
                  "email": "string",
                  "hub_id": "dn_hub"
              }
          }
      }
  }
  ```
- **Error Response:**

  ```json
  {
    "success": false,
    "error": "string" // Error description
  }
  ```

---

## Users Endpoints

**GET /users**
  - **Description:** Get a list of users based on optional query parameters.
  - **Request:**
    - **Query Parameters:**
      - `limit`: `number` (optional, default -1, query full db) - Maximum number of users to return.
      - `page`: `number` (optional, default -1) - Page number for pagination.
      - `role`: `string` (optional) - Filter users by role (`customer`, `vendor`, `shipper`).
  - **Response:**
    ```json
    {
      "success": true,
      "data": {
        "users": [
          {
            "id": "string",
            "username": "string",
            "email": "string",
            "role": "customer" | "vendor" | "shipper",
            "profile_picture": "string"
          }
        ],
        "count": "number"//total retrieve
    }
    ```
  - **Error Responses:**
    ```json
    {
      "success": false,
      "error": "string" // Error description
    }
    ```

---

**GET /users/:id**
  - **Description:** Get a single user by their ID.
  - **Request:**
    - **Path Parameter:**
      - `id`: `string` (required) - The ID of the user to retrieve.
  - **Response:**
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "string",
          "username": "string",
          "email": "string",
          "role": "customer" | "vendor" | "shipper",
          "profile_picture": "string",
          "name": "string", // Optional, for customers
          "address": "string", // Optional, for customers
          "business_name": "string", // Optional, for vendors
          "business_address": "string", // Optional, for vendors
          "distributionHub": "string" // Optional, for shippers
        }
      }
    }
    ```
  - **Error Responses:**
    ```json
    {
      "success": false,
      "error": "string" // Error description
    }
    ```

---

**DELETE /users/me**
  - **Description:** Delete the currently authenticated user's account.
  - **Request:**
    - No request body.
  - **Response:**
    ```json
    {
      "success": true,
      "message": "User account deleted successfully."
    }
    ```
  - **Error Responses:**
    ```json
    {
      "success": false,
      "error": "string" // Error description
    }
    ```

---

**PATCH /users/update-password**
  - **Description:** Update the profile information of the currently authenticated user.
  - **Request:**
    ```json
    {
      "password": "string", 
      "newPassword": "string"
    }
    ```
  - **Response:**
    ```json
    {
    "success": true,
    "message": "Successfully update user {id}"
    }
    ```
  - **Error Responses:**
    ```json
    {
      "success": false,
      "error": "string" // Error description
    }
    ```

---

**POST /users/upload-image**
  - **Description:** Upload a new profile image for the authenticated user.
  - **Request:**
    - Content-Type: `multipart/form-data`
    - Body: Form data with the following field:
      - `file`: File (image file)
  - **File Requirements:**
    - Maximum file size: 10MB
    - Supported formats: PNG, JPEG.
  - **Response:**
    ```json
    {
        "success": true,
        "message": "imagename"
    }
    ```
  - **Error Responses:**
    ```json
    {
      "success": false,
      "error": "string" // Error description
    }
    ```

---
## Shippers Endpoints

**GET /shippers**
  - **Description:** Get a list of shippers based on optional query parameters.
  - **Request:**
    - **Query Parameters:**
      - `limit`: `number` (optional, default -1, query full db) - Maximum number of users to return.
      - `page`: `number` (optional, default -1) - Page number for pagination.
  - **Response:**
    ```json
    {
      "success": true,
      "data": {
        "users": [
          {
              "id": "string",
              "hub_id": "string",
              "email": "string",
              "username": "string",
              "profile_picture": "string"
          }
        ],
        "count": "number"//total retrieve
    }
    ```
  - **Error Responses:**
    ```json
    {
      "success": false,
      "error": "string" // Error description
    }
    ```

---

## Vendors Endpoints

**GET /vendors**
  - **Description:** Get a list of vendors based on optional query parameters.
  - **Request:**
    - **Query Parameters:**
      - `limit`: `number` (optional, default -1, query full db) - Maximum number of users to return.
      - `page`: `number` (optional, default -1) - Page number for pagination.
  - **Response:**
    ```json
    {
      "success": true,
      "data": {
        "users": [
          {
              "id": "string",
              "business_name": "string",
              "business_address": "string",
              "email": "string",
              "username": "string",
              "profile_picture": ""
          }
        ],
        "count": "number"//total retrieve
    }
    ```
  - **Error Responses:**
    ```json
    {
      "success": false,
      "error": "string" // Error description
    }
    ```

---

## Orders Endpoints
**Authentication**: 
- `Required`: (role: `shipper')


### GET /orders
**GET /api/orders**
**Function**: Fetch all orders by hubID
  - **Description:**: Receive all the order related to hubID by shipper
  
**Query Parameters (optional):**
- `page`: number (default 1, min 1)
- `size`: number (default 10, max 30)

  - **Request:**
    ```
     none
    ```
  - **Response:**
    ```json
    {
        "success": true,
        "message": {
            "data": {
                "orders": [
                    {
                        "id": "string",
                        "customer_id": "string",
                        "hub_id": "string",
                        "status": "active",
                        "total_price": number
                    }
                ],
                "count": number,
                "page": number,
                "size": number
            }
        }
    }
    ```
  - **Error Responses:**
    ```json
    {
    "success": false,
    "message": "string" //error description
    }

    ```
- **example**
    ```json
        {
            "success": true,
            "message": {
                "data": {
                    "orders": [
                        {
                            "id": "8e648b53-1aa2-48c7-bb09-72dc019a6fab",
                            "customer_id": "398d0185-8e1e-4268-bf49-5f3a155e74d1",
                            "hub_id": "hcm_hub",
                            "status": "active",
                            "total_price": 16301000
                        },
                        {
                            "id": "7568be7c-22a7-4284-b9ad-3571e950f0c6",
                            "customer_id": "398d0185-8e1e-4268-bf49-5f3a155e74d1",
                            "hub_id": "hcm_hub",
                            "status": "active",
                            "total_price": 5050000
                        }
                    ],
                    "count": 2,
                    "page": 1,
                    "size": 10
                }
        }
    ```

---

### /orders/:id/status
**Function**: Change the order status
- **Description:**: change the active order to delivered or canceled
 - **Path Parameter:**
      - `id`: `string` (required) - The ID of order
  - **Request:**
    ```json
    {
	    "status": "delivered" | "canceled"
    }
    ```
  - **Response:**
    ```json
    {
        "success": true,
        "message": {
            "message": "string",
            "data": {
                "order": {
                    "id": "string",
                    "customer_id": "string",
                    "hub_id": "string",
                    "status": "string",
                    "total_price": number
                }
            }
        }
    }

    ```
  - **Error Responses:**
    ```json
    {
    "success": false,
    "message": "string" //order not found
    }

    ```

- **example**

    **Request:**

    ```json
        {
            "status": "delivered"
        }
    ```****

    **Response:**
    ```json
        {
            "success": true,
            "message": {
                "message": "Order status updated",
                "data": {
                    "order": {
                        "id": "8e648b53-1aa2-48c7-bb09-72dc019a6fab",
                        "customer_id": "398d0185-8e1e-4268-bf49-5f3a155e74d1",
                        "hub_id": "hcm_hub",
                        "status": "delivered",
                        "total_price": 16301000
                    }
                }
            }
        }
    ```

---

### GET /orders/:id/Items
**Function**: get all the order item list 
- **Description:**: Receive all the order related to hubID by shipper
 - **Path Parameter:**
      - `id`: `string` (required) - The ID of order.
  - **Request:**
    ```
    none
    ```
  - **Response:**
    ```json
    {
        "success": true,
        "message": {
            "order_id": "string",
            "customer": {
                "name": "string",
                "address": "string"
            },
            "items": [
                {
                    "order_id": "string",
                    "product_id": "string",
                    "product_name": "string",
                    "quantity": number,
                    "price_at_order_time": number,
                    "total": number,
                    "image": "string"
                },
                
            ],
            "count": 1
        }
    }

    ```
  - **Error Responses:**
    ```json
    {
    "success": false,
    "message": "string" //error description
    }

    ```
---



## ShoppingCarts Endpoints
**Authentication**: 
- `Required`: (role: `customer`)


### GET /cart
**Function**: Fetch all product in shopping cart
- **Description:**: Receive all the product in shopping cart

**Query Parameters (optional):**
- `page`: number (default 1, min 1)
- `size`: number (default 10, max 30)

- **Request:**
    ```
    none
    ```

- **Response:**
    ```json
    {
        "success": true,
        "message": {
            "items": [
                {
                    "id": "string",
                    "product_id": "string",
                    "name": "string",
                    "quantity": number,
                    "price": number,
                    "subtotal": number,
                    "image": "string"
                },
            ],
            "count": number,
            "page": number,
            "size": number
        }
    }
    ```
- **Response:**
    ```json
    {
        "success": false,
        "message": "string" ////error description
    }
    ```

- **example**
    **response**: 
    ```json
            {
                "success": true,
                "message": {
                    "items": [
                        {
                            "id": "5dcb1f2b-0a65-4ea3-99b8-814cdf0eb375",
                            "product_id": "24ca7ecf-d618-4ac3-85c5-ea176cc66d8e",
                            "name": "Luxury Smart Watch",
                            "quantity": 2,
                            "price": 2500000,
                            "subtotal": 5000000,
                            "image": "https://udgzhggwprkrqkmtthfi.supabase.co/storage/v1/object/public/productimages/luxurywatch.jpg"
                        },
                        {
                            "id": "1bb58f32-95e9-447d-bf86-4e4bfaa8d985",
                            "product_id": "lksdlfkjsalfdjkksdlj",
                            "name": "condom",
                            "quantity": 2,
                            "price": 100000,
                            "subtotal": 200000,
                            "image": "https://udgzhggwprkrqkmtthfi.supabase.co/storage/v1/object/public/productimages/PinkKondom.jpg"
                        }
                    ],
                    "count": 2,
                    "page": 1,
                    "size": 10
                }
            }
    ```

---

### DELETE /removeItem/:id
**Function**: Remove product by id
- **Description:**: remove the product in cart by product id
 - **Path Parameter:**
      - `id`: `string` (required) - The ID of product
- **Request:**
    ```
    none
    ```
- **Response:**
```json
    {
        "success": true,
        "message": {
            "data": {
                "removed": boolean,
                "id": "string"
            }
        }
    }
```

- **Error Responses:**
    ```json
    {
        "success": false,
        "message": "string" //error description
    }

    ```
- **example**:
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
                "removed": true,
                "id": "24ca7ecf-d618-4ac3-85c5-ea176cc66d8e"
            }
        }
    }
```

---

### POST /cart/checkout
**Function**: check out the product in shopping cart
- **Description:**: caculate the total price of shopping cart, after checkout, remove the product in shopping cart, create an order with the order item list
- **Request:**
    ```
    none
    ```
- **Response:**
    ```json
        {
            "success": true,
            "message": {
                "message": "string",
                "order": {
                    "id": "string",
                    "hub_id": "string",
                    "status": "string",
                    "total_price": number
                }
            }
        }   
    ```

- **Error Responses:**
    ```json
        {
            "success": false,
            "message": "string" //error description
        }

    ```


- **example**:
    **Response:**
    ```json
            {
                "success": true,
                "message": {
                    "message": "Checkout success",
                    "order": {
                        "id": "260267ce-2cb8-4117-a690-b3f8a059f547",
                        "hub_id": "hcm_hub",
                        "status": "active",
                        "total_price": 100000
                    }
                }
            }
    ```
---

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
            "image": "string",
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
- Image is returned as a public URL.

---
### GET /products/:productId
Retrieve a specific product by ID.

**Authentication**: 
- `Required`: (role: `customer`, `vendor`)

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
- Vendor can only access the details of their own products.

---
### POST /products
Create a new product. 

**Authentication**: 
- Required (role: `vendor`)

**Request:** (multipart/ form-data)
- `name`: string (required)
- `price`: positive number (required)
- `description`: string (required) (less than 500 characters)
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
            "description": "string", //less than 500 characters
            "image": "string",
            "category": "string",
            "instock": boolean //optional
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
- If `instock` is not provided, it is set to `true` by default.
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
            "image": "string", //must use form-data
            "category": "string",
            "instock": boolean //must use JSON
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
- Image is stored as path.
- If updating an image, `form-data` is `required`. Otherwise, either `form-data` or `JSON` works.
- If updating instock status, must use JSON.
---

---

### POST /products/:id/addToCart
**Function**: add product to cart
- **Description:**: add the product in cart by the product id
 - **Path Parameter:**
      - `id`: `string` (required) - The ID of the product

- **Request:**
    ```json
        {
            "quantity": number 
        }
    ```
    **OR**
    ```
    none
    ```
- **Response:**
```json
    {
        "success": true,
        "message": {
            "item": {
                "id": "string",
                "customer_id": "string",
                "product_id": "string",
                "quantity": number
            }
        }
    }
```

- **Error Responses:**
    ```json
        {
            "success": false,
            "message": "string" //error description
        }

    ```
**Notes:**
- The request (JSON) can none or add the specific number of product want to add to cart

- **example**:
    **Request:**
    ```json
        {
            "quantity": 500
        }
    ```

    **Response:**
    ```json
            {
                "success": true,
                "message": {
                    "item": {
                        "id": "1bb58f32-95e9-447d-bf86-4e4bfaa8d985",
                        "customer_id": "398d0185-8e1e-4268-bf49-5f3a155e74d1",
                        "product_id": "lksdlfkjsalfdjkksdlj",
                        "quantity": 704
                    }
                }
            }
    ```
