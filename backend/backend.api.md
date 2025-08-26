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