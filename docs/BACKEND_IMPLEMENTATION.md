# Backend Implementation Documentation

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Design](#database-design)
5. [Authentication System](#authentication-system)
6. [API Architecture](#api-architecture)
7. [Services Layer](#services-layer)
8. [Middleware](#middleware)
9. [Controllers](#controllers)
10. [Routing System](#routing-system)
11. [File Upload & Image Handling](#file-upload--image-handling)
12. [Error Handling](#error-handling)
13. [Security Features](#security-features)
14. [Development & Deployment](#development--deployment)

## Overview

This backend implementation is a comprehensive e-commerce API built with Node.js, Express.js, and TypeScript. It supports three distinct user roles (Customer, Vendor, Shipper) with role-based access control, product management, shopping cart functionality, order processing, and distribution hub management.

The system is designed as a RESTful API that serves a React frontend and uses Supabase as both the authentication provider and database solution. The architecture follows clean code principles with clear separation of concerns through a layered approach.

## Technology Stack

### Core Technologies

- **Runtime:** Node.js
- **Framework:** Express.js v5.1.0
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth

### Key Dependencies

- **@supabase/supabase-js** (v2.53.0) - Database and authentication client
- **express** (v5.1.0) - Web framework
- **cors** (v2.8.5) - Cross-origin resource sharing
- **cookie-parser** (v1.4.7) - Cookie handling
- **bcrypt** (v6.0.0) - Password hashing
- **multer** (v2.0.2) - File upload handling
- **zod** (v4.0.17) - Schema validation
- **uuid** (v11.1.0) - Unique identifier generation
- **dotenv** (v17.0.1) - Environment variable management

### Development Tools

- **nodemon** (v3.1.10) - Development server with hot reload
- **ts-node** (v10.9.2) - TypeScript execution
- **@types/\* packages** - TypeScript type definitions

## Project Structure

```
backend/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── customer.controller.ts
│   │   ├── orderController.ts
│   │   ├── productController.ts
│   │   ├── shipper.controller.ts
│   │   ├── user.controller.ts
│   │   └── vendor.controller.ts
│   ├── db/
│   │   └── db.ts            # Database configuration and connection
│   ├── middleware/          # Custom middleware
│   │   ├── requireAuth.ts   # Authentication middleware
│   │   └── validation.middleware.ts
│   ├── routes/              # Route definitions
│   │   ├── router.ts        # Main router
│   │   ├── auth.router.ts
│   │   ├── customer.router.ts
│   │   ├── orders.router.ts
│   │   ├── products.router.ts
│   │   ├── shipper.router.ts
│   │   ├── user.router.ts
│   │   └── vendor.router.ts
│   ├── service/             # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── customer.service.ts
│   │   ├── image.service.ts
│   │   ├── orders.service.ts
│   │   ├── products.service.ts
│   │   ├── shipper.service.ts
│   │   ├── user.service.ts
│   │   └── vendor.service.ts
│   ├── types/
│   │   └── general.type.ts  # TypeScript type definitions
│   ├── utils/               # Utility functions
│   │   ├── debug.ts
│   │   ├── generator.ts
│   │   ├── json_mes.ts
│   │   └── password.ts
│   └── index.ts             # Application entry point
├── package.json
├── tsconfig.json
└── Dockerfile.backend
```

## Database Design

The application uses Supabase PostgreSQL with a comprehensive schema supporting multi-role e-commerce functionality.

### Database Schema

```typescript
interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string; // UUID primary key
          email: string; // Unique email for authentication
          password: string; // Hashed password
          username: string; // Unique username
          profile_picture: string;
          role: UserRole; // 'customer' | 'vendor' | 'shipper'
        };
        Insert: {
          id: string;
          email: string;
          password: string;
          username: string;
          role: UserRole;
        };
        Update: {
          password: string;
          profile_picture: string;
        };
      };

      distribution_hubs: {
        Row: {
          id: string;
          name: string;
          address: string;
        };
      };

      vendors: {
        Row: {
          id: string; // References users.id
          business_name: string;
          business_address: string;
        };
      };

      customers: {
        Row: {
          id: string; // References users.id
          address: string;
          name: string;
        };
      };

      shippers: {
        Row: {
          id: string; // References users.id
          hub_id: string; // References distribution_hubs.id
        };
      };

      products: {
        Row: {
          id: string;
          vendor_id: string; // References vendors.id
          name: string;
          price: number;
          description: string;
          image: string;
          category: string;
          instock: boolean;
        };
      };

      shopping_carts: {
        Row: {
          id: string;
          customer_id: string; // References customers.id
          product_id: string; // References products.id
          quantity: number;
        };
      };

      orders: {
        Row: {
          id: string;
          customer_id: string; // References customers.id
          hub_id: string; // References distribution_hubs.id
          status: string; // 'pending' | 'delivered' | 'canceled'
          total_price: number;
        };
      };

      order_items: {
        Row: {
          id: string;
          order_id: string; // References orders.id
          product_id: string; // References products.id
          quantity: string;
          price_at_order_time: number;
        };
      };
    };
  };
}
```

### Database Client Configuration

```typescript
// Two Supabase clients for different purposes
export const supabaseClient: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseClientKey // For authentication operations
);

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseKey // For database operations with admin privileges
);
```

## Authentication System

The authentication system leverages Supabase Auth with custom role-based access control.

### Authentication Flow

1. **Registration Process:**

   - User provides credentials and role-specific data
   - Account created in Supabase Auth
   - User record created in database with hashed password
   - Role-specific record created (customer/vendor/shipper)
   - JWT tokens returned in HTTP-only cookies

2. **Login Process:**

   - Credentials verified through Supabase Auth
   - User data retrieved from database
   - Access and refresh tokens set as secure cookies

3. **Token Management:**
   - Access tokens for API requests
   - Refresh tokens for automatic renewal
   - Secure HTTP-only cookies prevent XSS attacks

### Role-Based Registration

```typescript
// Customer Registration
const registerCustomerBodySchema = z
  .object({
    email: z.email("Invalid email format").trim(),
    password: passwordSchema,
    username: usernameSchema,
    address: z.string().trim(),
    name: z.string().trim(),
  })
  .strict();

// Vendor Registration
const registerVendorBodySchema = z
  .object({
    email: z.email("Invalid email format").trim(),
    password: passwordSchema,
    username: usernameSchema,
    business_address: z.string().trim().min(5),
    business_name: z.string().trim().min(5),
  })
  .strict();

// Shipper Registration
const registerShipperBodySchema = z
  .object({
    email: z.email("Invalid email format").trim(),
    password: passwordSchema,
    username: usernameSchema,
    hub_id: z.string().trim(),
  })
  .strict();
```

### Password Security

```typescript
// Password requirements enforced via Zod schema
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
export const passwordSchema = z
  .string()
  .regex(
    passwordRegex,
    "Password 8-20, includes upper, lower, digit, special !@#$%^&*"
  )
  .trim();
```

## API Architecture

The API follows RESTful principles with consistent response formats and proper HTTP status codes.

### Standard Response Format

```typescript
// Success Response
interface SuccessResponse {
  success: true;
  message: any;
}

// Error Response
interface ErrorResponse {
  success: false;
  message: string;
}
```

### Response Utilities

```typescript
export const SuccessJsonResponse = (
  res: Response,
  statusCode: number,
  message: any
) => {
  res.status(statusCode).json({
    success: true,
    message,
  });
};

export const ErrorJsonResponse = (
  res: Response,
  statusCode: number,
  message: string
) => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};
```

## Services Layer

The services layer encapsulates all business logic and database operations.

### User Service

```typescript
export const UserService = {
  // Create new user
  async createUser(user: UserInsert): Promise<User | null>,

  // Get user by ID with optional role data
  async getUserById(id: string, includeRoleData: boolean = true): Promise<FullUser | User | null>,

  // Get users with filtering and pagination
  async getUsers(filters: UsersFilters, pagination: Pagination): Promise<FullUser[]>,

  // Update user
  async updateUser(id: string, updates: UserUpdate): Promise<boolean>,

  // Delete user
  async deleteUser(id: string): Promise<boolean>
};
```

### Product Service

```typescript
export const ProductService = {
  // Get products with filtering and pagination
  async getProducts(filters: ProductFilters, pagination: Pagination): Promise<Product[]>,

  // Get single product
  async getProductById(id: string): Promise<Product | null>,

  // Create product (vendor only)
  async createProduct(product: ProductInsert): Promise<Product | null>,

  // Update product (vendor only)
  async updateProduct(id: string, updates: ProductUpdate): Promise<Product | null>,

  // Get vendor's products
  async getVendorProducts(vendorId: string, pagination: Pagination): Promise<Product[]>
};
```

### Shopping Cart Service

```typescript
export const ShoppingCartService = {
  // Get cart items for customer
  async getCartItems(customerId: string, pagination: Pagination): Promise<ShoppingCartItem[]>,

  // Add item to cart
  async addItemToCart(item: ShoppingCartInsert): Promise<ShoppingCartItem | null>,

  // Update cart item quantity
  async updateCartItem(id: string, quantity: number): Promise<boolean>,

  // Remove item from cart
  async removeCartItem(id: string): Promise<boolean>,

  // Clear entire cart
  async clearCart(customerId: string): Promise<boolean>,

  // Checkout cart (convert to order)
  async checkoutCart(customerId: string): Promise<Order | null>
};
```

### Order Service

```typescript
export const OrderService = {
  // Get orders by hub (for shippers)
  async getOrdersByHub(hubId: string, pagination: Pagination): Promise<Order[]>,

  // Get single order
  async getOrderById(id: string): Promise<Order | null>,

  // Update order status
  async updateOrderStatus(id: string, status: string): Promise<boolean>,

  // Get order items
  async getOrderItems(orderId: string): Promise<OrderItem[]>
};
```

## Middleware

### Authentication Middleware

The `requireAuth` middleware handles authentication and authorization:

```typescript
export function requireAuth(role: string | string[] = "") {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 1. Extract tokens from cookies
    const token = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    // 2. Verify access token with Supabase
    let { data, error } = await supabaseClient.auth.getUser(token);

    // 3. Handle token refresh if access token expired
    if (error && refreshToken) {
      const { data: refreshData, error: refreshError } =
        await supabaseClient.auth.refreshSession({
          refresh_token: refreshToken,
        });

      if (!refreshError && refreshData.session) {
        // Update cookies with new tokens
        res.cookie("access_token", refreshData.session.access_token, options);
        res.cookie("refresh_token", refreshData.session.refresh_token, options);
      }
    }

    // 4. Get user from database
    const user = await UserService.getUserById(data.user.id, false);

    // 5. Check role authorization
    if (roles.length > 0 && !roles.includes(user.role)) {
      return ErrorJsonResponse(res, 403, "Unauthorized: insufficient role");
    }

    // 6. Attach user info to request
    req.user_id = data.user.id;
    req.user_role = user.role;
    next();
  };
}
```

### Validation Middleware

```typescript
export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`
        );
        return ErrorJsonResponse(res, 400, errorMessages.join(", "));
      }
      return ErrorJsonResponse(res, 400, "Validation failed");
    }
  };
};
```

## Controllers

Controllers handle HTTP requests and coordinate between middleware, services, and responses.

### Authentication Controller

```typescript
export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Authenticate with Supabase
    const session = await signInUser(email, password);
    if (!session) {
      return ErrorJsonResponse(res, 401, "Invalid credentials");
    }

    // Get user data from database
    const user = await UserService.getUserById(session.user.id);
    if (!user) {
      return ErrorJsonResponse(res, 404, "User not found in database");
    }

    // Set secure cookies
    res.cookie("access_token", session.access_token, cookieOptions);
    res.cookie("refresh_token", session.refresh_token, cookieOptions);

    // Return user data
    SuccessJsonResponse(res, 200, { data: { user } });
  } catch (error) {
    ErrorJsonResponse(res, 500, "Internal server error");
  }
};
```

### Product Controller

```typescript
export const getProductsController = async (req: Request, res: Response) => {
  try {
    // Parse and validate query parameters
    const filters = parseProductFilters(req.query);
    const pagination = parsePagination(req.query);

    // Get products from service
    const products = await ProductService.getProducts(filters, pagination);
    const totalProducts = await ProductService.getProductCount(filters);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalProducts / pagination.size);

    SuccessJsonResponse(res, 200, {
      products,
      currentPage: pagination.page,
      totalPages,
      totalProducts,
      limit: pagination.size,
    });
  } catch (error) {
    ErrorJsonResponse(res, 500, "Failed to fetch products");
  }
};
```

## Routing System

The application uses a hierarchical routing system with role-based access control.

### Main Router Configuration

```typescript
const apiRouter = Router();

// Public routes
apiRouter.use("/auth", authRouter);
apiRouter.use("/products", ProductRouter); // Some endpoints public

// Protected routes
apiRouter.use("/users", requireAuth(), UserRouter);
apiRouter.use("/customers", requireAuth(), CustomerRouter);
apiRouter.use("/vendors", requireAuth(), VendorRouter);
apiRouter.use("/shippers", requireAuth(), ShipperRouter);
apiRouter.use("/distribution-hubs", requireAuth(), DistributionHubRouter);

// Role-specific routes
apiRouter.use("/orders", requireAuth("shipper"), OrderRouter);
apiRouter.use("/cart", requireAuth("customer"), ShoppingCartRouter);
```

### Route Examples

#### Authentication Routes

```
POST /api/auth/login                    # User login
POST /api/auth/register/customer        # Customer registration
POST /api/auth/register/vendor          # Vendor registration
POST /api/auth/register/shipper         # Shipper registration
POST /api/auth/logout                   # User logout
```

#### Product Routes

```
GET    /api/products                    # Get products (public)
GET    /api/products/:id                # Get single product (public)
POST   /api/products                    # Create product (vendor only)
PATCH  /api/products/:id                # Update product (vendor only)
GET    /api/products/vendorProducts     # Get vendor's products (vendor only)
POST   /api/products/:id/addToCart      # Add to cart (customer only)
```

#### Shopping Cart Routes

```
GET    /api/cart                        # Get cart items (customer only)
POST   /api/cart/checkout               # Checkout cart (customer only)
DELETE /api/cart/removeItem/:productId  # Remove cart item (customer only)
```

#### Order Routes

```
GET    /api/orders                      # Get orders by hub (shipper only)
GET    /api/orders/:id                  # Get single order (shipper only)
PATCH  /api/orders/:id/status           # Update order status (shipper only)
GET    /api/orders/:id/Items            # Get order items (shipper only)
```

## File Upload & Image Handling

The application handles file uploads for product images and profile pictures using Multer and Supabase Storage.

### Image Service

```typescript
export const ImageService = {
  // Upload image to Supabase Storage
  async uploadImage(
    file: Express.Multer.File,
    folder: string
  ): Promise<string | null> {
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from("images")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) return null;
    return filePath;
  },

  // Get public URL for image
  async getPublicImageUrl(imagePath: string): Promise<string | null> {
    const { data } = supabase.storage.from("images").getPublicUrl(imagePath);

    return data.publicUrl;
  },

  // Delete image from storage
  async deleteImage(imagePath: string): Promise<boolean> {
    const { error } = await supabase.storage.from("images").remove([imagePath]);

    return !error;
  },
};
```

### Multer Configuration

```typescript
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
```

## Error Handling

### Centralized Error Response

```typescript
export const ErrorJsonResponse = (
  res: Response,
  statusCode: number,
  message: string
) => {
  debugError(`Error ${statusCode}: ${message}`);
  res.status(statusCode).json({
    success: false,
    message,
  });
};
```

### Validation Error Handling

```typescript
// Zod validation errors
catch (error) {
  if (error instanceof z.ZodError) {
    const errorMessages = error.errors.map(err =>
      `${err.path.join('.')}: ${err.message}`
    );
    return ErrorJsonResponse(res, 400, errorMessages.join(', '));
  }
  return ErrorJsonResponse(res, 500, 'Internal server error');
}
```

### Database Error Handling

```typescript
// Supabase/PostgreSQL error handling
if (error) {
  debugError("Database operation failed:", error.message);
  if (error.code === "23505") {
    // Unique constraint violation
    return ErrorJsonResponse(res, 409, "Resource already exists");
  }
  return ErrorJsonResponse(res, 500, "Database error");
}
```

## Security Features

### 1. Password Security

- Bcrypt hashing with salt rounds
- Strong password requirements (8-20 chars, mixed case, numbers, special chars)
- Password validation on both client and server

### 2. Authentication Security

- JWT tokens with expiration
- Secure HTTP-only cookies
- Automatic token refresh
- Session invalidation on logout

### 3. Authorization Security

- Role-based access control
- Route-level permission checking
- Resource ownership validation

### 4. Input Validation

- Zod schema validation for all inputs
- SQL injection prevention through parameterized queries
- XSS prevention through output encoding

### 5. CORS Configuration

```typescript
app.use(
  cors({
    origin: true, // Allow all origins (configure for production)
    credentials: true, // Allow cookies
  })
);
```

### 6. File Upload Security

- File type validation
- File size limits
- Sanitized file names
- Secure storage paths

## Development & Deployment

### Environment Configuration

```bash
# Required Environment Variables
SUPABASE_URL=your_supabase_project_url
SUPABASE_SECRET_KEY=your_supabase_secret_key
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
PRODUCTION_SITE=false
```

### Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Docker Compose Integration

```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run dev
```

## API Endpoints Summary

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register/customer` - Customer registration
- `POST /api/auth/register/vendor` - Vendor registration
- `POST /api/auth/register/shipper` - Shipper registration
- `POST /api/auth/logout` - User logout

### Users

- `GET /api/users` - Get users (admin)
- `GET /api/users/:id` - Get user by ID
- `DELETE /api/users/me` - Delete own account
- `PATCH /api/users/update-password` - Update password
- `POST /api/users/upload-image` - Upload profile image

### Products

- `GET /api/products` - Get products (public)
- `GET /api/products/:id` - Get product details (public)
- `POST /api/products` - Create product (vendor)
- `PATCH /api/products/:id` - Update product (vendor)
- `GET /api/products/vendorProducts` - Get vendor's products (vendor)
- `POST /api/products/:id/addToCart` - Add to cart (customer)

### Shopping Cart

- `GET /api/cart` - Get cart items (customer)
- `POST /api/cart/checkout` - Checkout cart (customer)
- `DELETE /api/cart/removeItem/:productId` - Remove cart item (customer)

### Orders

- `GET /api/orders` - Get orders by hub (shipper)
- `GET /api/orders/:id` - Get order details (shipper)
- `PATCH /api/orders/:id/status` - Update order status (shipper)
- `GET /api/orders/:id/Items` - Get order items (shipper)

### Distribution Hubs

- `GET /api/distribution-hubs` - Get distribution hubs

### Role-Specific Endpoints

- `GET /api/customers` - Get customers list
- `GET /api/vendors` - Get vendors list
- `GET /api/shippers` - Get shippers list

This backend implementation provides a robust, scalable foundation for a multi-role e-commerce platform with comprehensive security, validation, and business logic handling.
