# Frontend Implementation Documentation


## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Routing System](#routing-system)
5. [State Management](#state-management)
6. [Authentication System](#authentication-system)
7. [Component Architecture](#component-architecture)
8. [UI/UX Design System](#uiux-design-system)
9. [API Integration](#api-integration)
10. [Role-Based Features](#role-based-features)
11. [Theme System](#theme-system)
12. [Form Handling & Validation](#form-handling--validation)
13. [Performance Optimizations](#performance-optimizations)
14. [Security Implementations](#security-implementations)
15. [Build & Deployment](#build--deployment)

## Overview

This frontend implementation is a modern, responsive React application built with React Router v7, Redux Toolkit for state management, and Tailwind CSS for styling. The application serves as a comprehensive e-commerce platform supporting three distinct user roles: Customers, Vendors, and Shippers, each with tailored interfaces and functionality.

The application emphasizes user experience with smooth navigation, real-time state updates, comprehensive form validation, and a cohesive design system. It implements modern React patterns including hooks, context providers, and functional components throughout.

## Technology Stack

### Core Technologies

- **Framework:** React 19.1.0
- **Router:** React Router v7.7.1
- **State Management:** Redux Toolkit v2.8.2 with Redux Persist v6.0.0
- **Styling:** Tailwind CSS v4.1.4
- **Language:** TypeScript v5.8.3
- **Build Tool:** Vite v6.3.3

### UI & Design Libraries

- **Component Library:** Radix UI (Accessible primitives)
  - `@radix-ui/react-dialog` - Modal dialogs
  - `@radix-ui/react-dropdown-menu` - Dropdown menus
  - `@radix-ui/react-select` - Select components
  - `@radix-ui/react-tabs` - Tab interfaces
  - `@radix-ui/react-switch` - Toggle switches
  - `@radix-ui/react-accordion` - Collapsible content
- **Icons:** Lucide React v0.536.0 & React Icons v5.5.0
- **Utility Libraries:**
  - `class-variance-authority` - Component styling variants
  - `clsx` - Conditional className utility
  - `tailwind-merge` - Tailwind class merging

### Form Management & Validation

- **Forms:** React Hook Form v7.62.0
- **Validation:** Zod v4.0.14
- **Form Integration:** @hookform/resolvers v5.2.1

### Additional Libraries

- **Theme Management:** next-themes v0.4.6
- **Notifications:** Sonner v2.0.7 (toast notifications)
- **Bot Detection:** isbot v5.1.27
- **CSS Animations:** tw-animate-css v1.3.6

## Project Architecture

```
frontend/
├── app/
│   ├── components/           # Reusable UI components
│   │   ├── home/            # Home page specific components
│   │   ├── layout/          # Layout components (Header, Footer)
│   │   ├── shared/          # Shared form components
│   │   └── ui/              # Base UI components (shadcn/ui style)
│   ├── lib/                 # Utility libraries and configurations
│   │   ├── redux/           # Redux store and slices
│   │   ├── api.ts           # API client and endpoints
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── schemas.ts       # Zod schemas for API responses
│   │   ├── theme.tsx        # Theme provider
│   │   ├── utils.ts         # General utilities
│   │   └── validators.ts    # Form validation schemas
│   ├── routes/              # Route components
│   │   ├── account/         # Account management pages
│   │   ├── auth/            # Authentication pages
│   │   ├── customer/        # Customer-specific pages
│   │   ├── shipper/         # Shipper-specific pages
│   │   ├── vendor/          # Vendor-specific pages
│   │   ├── about.tsx        # Static pages
│   │   ├── help.tsx
│   │   ├── home.tsx
│   │   └── privacy.tsx
│   ├── root.tsx             # Application root component
│   ├── routes.ts            # Route configuration
│   └── app.css              # Global styles
├── build/                   # Build output
├── public/                  # Static assets
├── components.json          # shadcn/ui configuration
├── package.json
├── react-router.config.ts   # React Router configuration
├── tsconfig.json
├── vite.config.ts
└── Dockerfile.frontend
```

## Routing System

The application uses React Router v7 with a file-based routing approach and role-based route protection.

### Route Configuration

```typescript
export default [
  index("routes/home.tsx"),

  // Static pages
  route("about", "routes/about.tsx"),
  route("privacy", "routes/privacy.tsx"),
  route("help", "routes/help.tsx"),

  // Authentication
  route("login", "routes/auth/login.tsx"),
  route("register/:role?", "routes/auth/register.tsx"),

  // Account management
  route("account", "routes/account/profile.tsx"),

  // Customer routes
  route("products", "routes/customer/products.tsx"),
  route("products/:productId", "routes/customer/product-detail.tsx"),
  route("cart", "routes/customer/cart.tsx"),

  // Vendor routes
  route("vendor/products", "routes/vendor/products.tsx"),
  route("vendor/products/new", "routes/vendor/add-product.tsx"),

  // Shipper routes
  route("shipper/orders", "routes/shipper/orders.tsx"),
  route("shipper/orders/:orderId", "routes/shipper/order-detail.tsx"),
] satisfies RouteConfig;
```

### Route Protection

Routes are protected based on user authentication status and role:

```typescript
// Example of protected route component
function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: string;
}) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      navigate("/");
      return;
    }
  }, [isAuthenticated, user, requiredRole, navigate]);

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
```

## State Management

The application uses Redux Toolkit with Redux Persist for state management, providing predictable state updates and persistence across browser sessions.

### Store Configuration

```typescript
// Store setup with persistence
const persistConfig = {
  key: "root",
  storage: createSafeStorage(), // SSR-safe storage
  whitelist: ["auth", "cart"], // Only persist auth and cart
};

const rootReducer = combineReducers({
  auth: authSlice,
  cart: cartSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/FLUSH",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/PERSIST",
          "persist/PURGE",
          "persist/REGISTER",
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});
```

### Auth Slice

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  role: "customer" | "vendor" | "shipper";
  profile_picture: string | null;
  // Role-specific fields
  name?: string; // Customer
  address?: string; // Customer
  business_name?: string; // Vendor
  business_address?: string; // Vendor
  hub_id?: string; // Shipper
}

interface AuthState {
  user: User | null;
}

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null } as AuthState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
  },
});
```

### Cart Slice

```typescript
interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  subtotal: number;
}

interface CartState {
  items: CartItem[];
  lastUpdated: string | null;
}

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], lastUpdated: null } as CartState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    addCartItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.productId === action.payload.productId
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        existingItem.subtotal = existingItem.quantity * existingItem.price;
      } else {
        state.items.push(action.payload);
      }
      state.lastUpdated = new Date().toISOString();
    },
    removeCartItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload
      );
      state.lastUpdated = new Date().toISOString();
    },
    clearCart: (state) => {
      state.items = [];
      state.lastUpdated = new Date().toISOString();
    },
  },
});
```

### Redux Hooks

```typescript
// Custom hooks for Redux
export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const login = useCallback(
    (userData: User) => {
      dispatch(authActions.login(userData));
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(authActions.logout());
    dispatch(cartActions.clearCart());
  }, [dispatch]);

  return { user, isAuthenticated, login, logout };
};

export const useCart = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const itemCount = useSelector(selectCartItemCount);
  const totalPrice = useSelector(selectCartTotal);

  const addItem = useCallback(
    (item: CartItem) => {
      dispatch(cartActions.addCartItem(item));
    },
    [dispatch]
  );

  const removeItem = useCallback(
    (productId: string) => {
      dispatch(cartActions.removeCartItem(productId));
    },
    [dispatch]
  );

  const clearCart = useCallback(() => {
    dispatch(cartActions.clearCart());
  }, [dispatch]);

  return { items, itemCount, totalPrice, addItem, removeItem, clearCart };
};
```

## Authentication System

The frontend authentication system integrates with the backend JWT-based authentication using secure HTTP-only cookies.

### Authentication Flow

1. **Login Process:**

   - User submits credentials via form
   - API call to `/api/auth/login`
   - Server sets HTTP-only cookies
   - User data stored in Redux store
   - Redirect to appropriate dashboard

2. **Registration Process:**

   - Role selection (Customer/Vendor/Shipper)
   - Role-specific form fields
   - API call to appropriate registration endpoint
   - Automatic login after successful registration

3. **Session Management:**
   - Automatic token refresh via API middleware
   - Global logout handler for expired sessions
   - Persistent authentication state via Redux Persist

### Authentication Components

```typescript
// Login component with form handling
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await loginApi(data);
      login(response.message.data.user);

      // Role-based redirection
      const redirectPath = getRedirectPath(response.message.data.user.role);
      navigate(redirectPath);

      toast.success("Login successful!");
    } catch (error) {
      toast.error(error.message || "Login failed");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField name='email' render={EmailField} />
        <FormField name='password' render={PasswordField} />
        <Button type='submit' disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Form>
  );
}
```

### Global Logout Handler

```typescript
// Automatic logout on token expiration
useEffect(() => {
  const handleGlobalLogout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      // Ignore API failure; still clear local state
    } finally {
      logout();
      navigate("/");
    }
  };

  setGlobalLogoutHandler(handleGlobalLogout);
  return () => clearGlobalLogoutHandler();
}, [logout, navigate]);
```

## Component Architecture

The application follows a modular component architecture with reusable UI components and feature-specific components.

### Base UI Components (shadcn/ui style)

```typescript
// Button component with variants
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### Layout Components

```typescript
// Header component with role-based navigation
export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  const handleLogout = async () => {
    try {
      await logoutApi();
      logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-16 items-center justify-between'>
        {/* Logo */}
        <Link to='/' className='flex items-center space-x-2'>
          <img src='/favicon.ico' alt='Logo' className='h-8 w-8' />
          <span className='font-bold'>E-Commerce</span>
        </Link>

        {/* Navigation */}
        <nav className='hidden md:flex items-center space-x-6'>
          {isAuthenticated ? (
            <RoleBasedNavigation user={user} itemCount={itemCount} />
          ) : (
            <GuestNavigation />
          )}
        </nav>

        {/* Mobile menu & user menu */}
        <div className='flex items-center space-x-4'>
          <ThemeToggle />
          {isAuthenticated && <UserMenu user={user} onLogout={handleLogout} />}
        </div>
      </div>
    </header>
  );
}

// Role-based navigation component
function RoleBasedNavigation({
  user,
  itemCount,
}: {
  user: User;
  itemCount: number;
}) {
  switch (user.role) {
    case "customer":
      return (
        <>
          <Link to='/products'>Products</Link>
          <Link to='/cart' className='flex items-center space-x-1'>
            <ShoppingCart className='h-4 w-4' />
            <span>Cart ({itemCount})</span>
          </Link>
        </>
      );
    case "vendor":
      return (
        <>
          <Link to='/vendor/products'>My Products</Link>
          <Link to='/vendor/products/new'>Add Product</Link>
        </>
      );
    case "shipper":
      return (
        <>
          <Link to='/shipper/orders'>Orders</Link>
        </>
      );
    default:
      return null;
  }
}
```

### Form Components

```typescript
// Reusable form field component
export function Field({
  label,
  error,
  description,
  children,
}: {
  label?: string;
  error?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='space-y-2'>
      {label && <Label className='text-sm font-medium'>{label}</Label>}
      {children}
      {description && (
        <p className='text-sm text-muted-foreground'>{description}</p>
      )}
      {error && <p className='text-sm text-destructive'>{error}</p>}
    </div>
  );
}

// Form field with React Hook Form integration
export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  render,
}: {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  description?: string;
  render: (field: ControllerRenderProps<T, Path<T>>) => React.ReactNode;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field
          label={label}
          error={fieldState.error?.message}
          description={description}
        >
          {render(field)}
        </Field>
      )}
    />
  );
}
```

## UI/UX Design System

The application implements a comprehensive design system based on Tailwind CSS with consistent spacing, typography, and color schemes.

### Design Tokens

```css
/* CSS Variables for theming */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark theme variables */
}
```

### Component Styling Patterns

```typescript
// Consistent card styling
const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        interactive: "hover:shadow-md transition-shadow cursor-pointer",
        elevated: "shadow-md",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

// Product card component
function ProductCard({ product }: { product: ProductDto }) {
  return (
    <Card className={cardVariants({ variant: "interactive" })}>
      <div className='aspect-square overflow-hidden rounded-md'>
        <img
          src={product.image || "/placeholder-product.jpg"}
          alt={product.name}
          className='h-full w-full object-cover transition-transform hover:scale-105'
        />
      </div>
      <CardContent className='pt-4'>
        <h3 className='font-semibold line-clamp-2'>{product.name}</h3>
        <p className='text-sm text-muted-foreground line-clamp-2 mt-1'>
          {product.description}
        </p>
        <div className='flex items-center justify-between mt-4'>
          <span className='text-lg font-bold'>${product.price}</span>
          <Badge variant={product.instock ? "default" : "secondary"}>
            {product.instock ? "In Stock" : "Out of Stock"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Responsive Design

```typescript
// Responsive grid layouts
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>

// Responsive navigation
<nav className="hidden md:flex items-center space-x-6">
  {/* Desktop navigation */}
</nav>
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="md:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent>
    {/* Mobile navigation */}
  </SheetContent>
</Sheet>
```

## API Integration

The frontend integrates with the backend API through a centralized API client with automatic error handling and type safety.

### API Client Architecture

```typescript
// Centralized request handler with Zod validation
async function request<T>(
  input: RequestInfo | URL,
  schema: z.ZodType<T>,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    credentials: "include", // Include cookies for authentication
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    // Handle 401 Unauthorized for automatic logout
    if (res.status === 401 && globalLogoutHandler) {
      globalLogoutHandler();
    }

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
```

### API Functions

```typescript
// Products API
export async function fetchProducts(params?: {
  page?: number;
  size?: number;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  name?: string;
}): Promise<{
  products: ProductDto[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
}> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.size) qs.set("size", String(params.size));
  if (params?.category) qs.set("category", params.category);
  if (params?.priceMin !== undefined)
    qs.set("priceMin", String(params.priceMin));
  if (params?.priceMax !== undefined)
    qs.set("priceMax", String(params.priceMax));
  if (params?.name) qs.set("name", params.name);

  const url = `${API_BASE}/products${qs.toString() ? "?" + qs.toString() : ""}`;
  const response = await request(url, ProductsApiResponseSchema);

  return {
    products: response.message.products,
    currentPage: response.message.currentPage ?? 1,
    totalPages: response.message.totalPages ?? 1,
    totalProducts: response.message.totalProducts ?? 0,
    limit: response.message.limit ?? 12,
  };
}

// Cart API
export async function addToCartApi(
  productId: string,
  quantity: number = 1
): Promise<{ success: boolean; item: any }> {
  return request(
    `${API_BASE}/products/${productId}/addToCart`,
    z.object({
      success: z.boolean(),
      message: z.object({ item: z.any() }),
    }),
    { method: "POST", body: JSON.stringify({ quantity }) }
  ).then((response) => ({
    success: response.success,
    item: response.message.item,
  }));
}
```

### React Query Integration (Future Enhancement)

```typescript
// Example of how React Query could be integrated
export function useProducts(params?: ProductsParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => fetchProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => addToCartApi(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
      toast.success("Added to cart!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add to cart");
    },
  });
}
```

## Role-Based Features

The application provides distinct interfaces and functionality for each user role.

### Customer Features

```typescript
// Customer product browsing page
export default function ProductsPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const { addItem } = useCart();

  const handleAddToCart = async (product: ProductDto) => {
    try {
      const response = await addToCartApi(product.id, 1);
      addItem({
        id: response.item.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        subtotal: product.price,
      });
      toast.success("Added to cart!");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div className='container py-8'>
      {/* Filters */}
      <ProductFilters filters={filters} onFiltersChange={setFilters} />

      {/* Product Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8'>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={() => handleAddToCart(product)}
          />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
      />
    </div>
  );
}

// Shopping cart page
export default function CartPage() {
  const { items, removeItem, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const response = await checkoutCartApi();
      clearCart();
      toast.success("Order placed successfully!");
      // Navigate to order confirmation
    } catch (error) {
      toast.error("Checkout failed");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className='container py-8'>
      <h1 className='text-3xl font-bold mb-8'>Shopping Cart</h1>

      {items.length === 0 ? (
        <EmptyCartState />
      ) : (
        <>
          <div className='space-y-4'>
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onRemove={() => removeItem(item.productId)}
              />
            ))}
          </div>

          <div className='mt-8 flex justify-between items-center'>
            <div className='text-2xl font-bold'>
              Total: ${totalPrice.toFixed(2)}
            </div>
            <Button onClick={handleCheckout} disabled={isCheckingOut} size='lg'>
              {isCheckingOut ? "Processing..." : "Checkout"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
```

### Vendor Features

```typescript
// Vendor product management
export default function VendorProductsPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const { user } = useAuth();

  const handleDeleteProduct = async (productId: string) => {
    try {
      await updateProductApi(productId, { instock: false });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, instock: false } : p))
      );
      toast.success("Product removed from stock");
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  return (
    <div className='container py-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>My Products</h1>
        <Button asChild>
          <Link to='/vendor/products/new'>
            <Plus className='h-4 w-4 mr-2' />
            Add Product
          </Link>
        </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {products.map((product) => (
          <VendorProductCard
            key={product.id}
            product={product}
            onEdit={() => {
              /* Navigate to edit page */
            }}
            onDelete={() => handleDeleteProduct(product.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Add/Edit product form
export default function AddProductPage() {
  const navigate = useNavigate();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      category: "",
      instock: true,
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("price", String(data.price));
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("instock", String(data.instock));
      if (data.image) formData.append("image", data.image);

      await createProductApi(data);
      toast.success("Product created successfully!");
      navigate("/vendor/products");
    } catch (error) {
      toast.error("Failed to create product");
    }
  };

  return (
    <div className='container py-8 max-w-2xl'>
      <h1 className='text-3xl font-bold mb-8'>Add New Product</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='name'
            label='Product Name'
            render={(field) => <Input {...field} />}
          />

          <FormField
            control={form.control}
            name='price'
            label='Price'
            render={(field) => (
              <Input
                {...field}
                type='number'
                step='0.01'
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
            )}
          />

          <FormField
            control={form.control}
            name='description'
            label='Description'
            render={(field) => <Textarea {...field} />}
          />

          <FormField
            control={form.control}
            name='category'
            label='Category'
            render={(field) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <FormField
            control={form.control}
            name='image'
            label='Product Image'
            render={(field) => (
              <Input
                type='file'
                accept='image/*'
                onChange={(e) => field.onChange(e.target.files?.[0])}
              />
            )}
          />

          <Button type='submit' className='w-full'>
            Create Product
          </Button>
        </form>
      </Form>
    </div>
  );
}
```

### Shipper Features

```typescript
// Shipper orders dashboard
export default function ShipperOrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "delivered">("all");

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: "delivered" | "canceled"
  ) => {
    try {
      await updateOrderStatusApi(orderId, status);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
      toast.success(`Order marked as ${status}`);
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  return (
    <div className='container py-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>Orders Dashboard</h1>

        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className='w-32'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Orders</SelectItem>
            <SelectItem value='pending'>Pending</SelectItem>
            <SelectItem value='delivered'>Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-4'>
        {filteredOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onUpdateStatus={(status) =>
              handleUpdateOrderStatus(order.id, status)
            }
          />
        ))}
      </div>
    </div>
  );
}

// Order detail page
export default function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemDetail[]>([]);

  useEffect(() => {
    if (orderId) {
      Promise.all([fetchOrder(orderId), fetchOrderItemsApi(orderId)]).then(
        ([orderData, itemsData]) => {
          setOrder(orderData);
          setOrderItems(itemsData.items);
        }
      );
    }
  }, [orderId]);

  if (!order) return <div>Loading...</div>;

  return (
    <div className='container py-8'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Order #{order.id}</h1>
          <p className='text-muted-foreground'>
            Status:{" "}
            <Badge variant={getStatusVariant(order.status)}>
              {order.status}
            </Badge>
          </p>
        </div>

        {order.status === "pending" && (
          <div className='space-x-2'>
            <Button
              variant='outline'
              onClick={() => handleUpdateStatus("canceled")}
            >
              Cancel Order
            </Button>
            <Button onClick={() => handleUpdateStatus("delivered")}>
              Mark as Delivered
            </Button>
          </div>
        )}
      </div>

      <div className='grid gap-8 md:grid-cols-2'>
        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className='space-y-2'>
              <div>
                <dt className='font-medium'>Customer:</dt>
                <dd>{orderItems[0]?.customer?.name}</dd>
              </div>
              <div>
                <dt className='font-medium'>Delivery Address:</dt>
                <dd>{orderItems[0]?.customer?.address}</dd>
              </div>
              <div>
                <dt className='font-medium'>Total Price:</dt>
                <dd>${order.total_price}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {orderItems.map((item) => (
                <div
                  key={item.product_id}
                  className='flex items-center space-x-4'
                >
                  <img
                    src={item.image || "/placeholder-product.jpg"}
                    alt={item.product_name}
                    className='h-16 w-16 rounded object-cover'
                  />
                  <div className='flex-1'>
                    <h4 className='font-medium'>{item.product_name}</h4>
                    <p className='text-sm text-muted-foreground'>
                      Quantity: {item.quantity} × ${item.price_at_order_time}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-medium'>${item.total}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

## Theme System

The application implements a comprehensive theming system supporting light and dark modes with smooth transitions.

### Theme Provider

```typescript
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: "dark" | "light" | "system";
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "app-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<"dark" | "light" | "system">(
    () =>
      (localStorage.getItem(storageKey) as "dark" | "light" | "system") ||
      defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: "dark" | "light" | "system") => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Theme toggle component
export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon'>
          <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
          <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Form Handling & Validation

The application uses React Hook Form with Zod validation for robust form handling.

### Validation Schemas

```typescript
// Registration form schemas
export const customerRegistrationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  username: z
    .string()
    .min(8, "Username must be at least 8 characters")
    .max(15, "Username must be at most 15 characters")
    .regex(/^[A-Za-z0-9]+$/, "Username can only contain letters and numbers"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password must be at most 20 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/,
      "Password must contain uppercase, lowercase, number, and special character"
    ),
  name: z.string().min(1, "Name is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

export const vendorRegistrationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  username: z
    .string()
    .min(8, "Username must be at least 8 characters")
    .max(15, "Username must be at most 15 characters")
    .regex(/^[A-Za-z0-9]+$/, "Username can only contain letters and numbers"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password must be at most 20 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/,
      "Password must contain uppercase, lowercase, number, and special character"
    ),
  businessName: z
    .string()
    .min(5, "Business name must be at least 5 characters"),
  businessAddress: z
    .string()
    .min(5, "Business address must be at least 5 characters"),
});

// Product form schema
export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  instock: z.boolean(),
  image: z.instanceof(File).optional(),
});
```

### Form Components with Validation

```typescript
// Registration form with role-specific fields
export default function RegisterForm({ role }: { role: string }) {
  const navigate = useNavigate();

  const getSchema = () => {
    switch (role) {
      case "customer":
        return customerRegistrationSchema;
      case "vendor":
        return vendorRegistrationSchema;
      case "shipper":
        return shipperRegistrationSchema;
      default:
        return customerRegistrationSchema;
    }
  };

  const form = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: getDefaultValues(role),
  });

  const onSubmit = async (data: any) => {
    try {
      const apiCall = getRegistrationApi(role);
      await apiCall(data);

      toast.success("Registration successful!");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Registration failed");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Common fields */}
        <FormField
          control={form.control}
          name='email'
          label='Email'
          render={(field) => <Input {...field} type='email' />}
        />

        <FormField
          control={form.control}
          name='username'
          label='Username'
          description='8-15 characters, letters and numbers only'
          render={(field) => <Input {...field} />}
        />

        <FormField
          control={form.control}
          name='password'
          label='Password'
          description='8-20 characters with uppercase, lowercase, number, and special character'
          render={(field) => <Input {...field} type='password' />}
        />

        {/* Role-specific fields */}
        {role === "customer" && (
          <>
            <FormField
              control={form.control}
              name='name'
              label='Full Name'
              render={(field) => <Input {...field} />}
            />
            <FormField
              control={form.control}
              name='address'
              label='Address'
              render={(field) => <Textarea {...field} />}
            />
          </>
        )}

        {role === "vendor" && (
          <>
            <FormField
              control={form.control}
              name='businessName'
              label='Business Name'
              render={(field) => <Input {...field} />}
            />
            <FormField
              control={form.control}
              name='businessAddress'
              label='Business Address'
              render={(field) => <Textarea {...field} />}
            />
          </>
        )}

        {role === "shipper" && (
          <FormField
            control={form.control}
            name='hub'
            label='Distribution Hub'
            render={(field) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectContent>
                  {distributionHubs.map((hub) => (
                    <SelectItem key={hub.id} value={hub.id}>
                      {hub.name} - {hub.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}

        <Button
          type='submit'
          className='w-full'
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? "Creating Account..."
            : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}
```

## Performance Optimizations

### Code Splitting & Lazy Loading

```typescript
// Lazy load route components
const ProductsPage = lazy(() => import("./routes/customer/products"));
const VendorDashboard = lazy(() => import("./routes/vendor/dashboard"));
const ShipperOrders = lazy(() => import("./routes/shipper/orders"));

// Wrap with Suspense
<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path='/products' element={<ProductsPage />} />
    <Route path='/vendor/*' element={<VendorDashboard />} />
    <Route path='/shipper/*' element={<ShipperOrders />} />
  </Routes>
</Suspense>;
```

### Image Optimization

```typescript
// Optimized image component with lazy loading
export function OptimizedImage({
  src,
  alt,
  className,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && <div className='absolute inset-0 bg-muted animate-pulse' />}
      <img
        src={src || "/placeholder-product.jpg"}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
        loading='lazy'
        {...props}
      />
      {error && (
        <div className='absolute inset-0 bg-muted flex items-center justify-center'>
          <span className='text-muted-foreground'>Failed to load image</span>
        </div>
      )}
    </div>
  );
}
```

### Memoization & Optimization

```typescript
// Memoized product card component
export const ProductCard = memo(
  ({
    product,
    onAddToCart,
  }: {
    product: ProductDto;
    onAddToCart: () => void;
  }) => {
    return (
      <Card className='hover:shadow-md transition-shadow'>
        <OptimizedImage
          src={product.image}
          alt={product.name}
          className='aspect-square w-full object-cover'
        />
        <CardContent className='p-4'>
          <h3 className='font-semibold line-clamp-2'>{product.name}</h3>
          <p className='text-sm text-muted-foreground line-clamp-2 mt-1'>
            {product.description}
          </p>
          <div className='flex items-center justify-between mt-4'>
            <span className='text-lg font-bold'>${product.price}</span>
            <Button onClick={onAddToCart} disabled={!product.instock} size='sm'>
              {product.instock ? "Add to Cart" : "Out of Stock"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
);

// Memoized filter component
export const ProductFilters = memo(
  ({
    filters,
    onFiltersChange,
  }: {
    filters: ProductFilters;
    onFiltersChange: (filters: ProductFilters) => void;
  }) => {
    const handleFilterChange = useCallback(
      (key: string, value: any) => {
        onFiltersChange({ ...filters, [key]: value });
      },
      [filters, onFiltersChange]
    );

    return <div className='space-y-4'>{/* Filter controls */}</div>;
  }
);
```

## Security Implementations

### XSS Prevention

```typescript
// Sanitized HTML rendering (if needed)
import DOMPurify from "dompurify";

export function SafeHTML({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const sanitizedHTML = DOMPurify.sanitize(html);
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
}
```

### Input Validation

```typescript
// Client-side validation for all forms
export const validateFormInput = (schema: z.ZodSchema) => (data: any) => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors.map((e) => e.message).join(", "));
    }
    throw error;
  }
};

// Secure file upload validation
export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPEG, PNG, and WebP images are allowed");
  }

  if (file.size > maxSize) {
    throw new Error("File size must be less than 5MB");
  }

  return true;
};
```

### Route Protection

```typescript
// HOC for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: string
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      if (requiredRole && user?.role !== requiredRole) {
        navigate("/");
        toast.error("Access denied");
        return;
      }
    }, [isAuthenticated, user, navigate]);

    if (!isAuthenticated) {
      return <div>Loading...</div>;
    }

    if (requiredRole && user?.role !== requiredRole) {
      return <div>Access denied</div>;
    }

    return <Component {...props} />;
  };
}

// Usage
export default withAuth(VendorDashboard, "vendor");
```

## Build & Deployment

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths(), tailwindcss()],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
        },
      },
    },
  },
});
```

### Docker Configuration

```dockerfile
# Multi-stage Docker build
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Configuration

```bash
# Environment variables
VITE_API_BASE=http://localhost:5000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build Scripts

```json
{
  "scripts": {
    "dev": "react-router dev",
    "build": "react-router build",
    "start": "react-router-serve ./build/server/index.js",
    "typecheck": "react-router typegen && tsc",
    "lint": "eslint app --ext .ts,.tsx",
    "lint:fix": "eslint app --ext .ts,.tsx --fix"
  }
}
```

This frontend implementation provides a comprehensive, user-friendly interface for the e-commerce platform with modern React patterns, robust state management, and excellent user experience across all user roles.
