# 8-Minute Code-First Talk Script: Multi-Role E-commerce Platform

**Duration:** 8 minutes  
**Format:** Code-first, no live demo, minimal intro.  
**Presenter cues included as "On Screen" and "Script".**

---

## 0:00–0:45 — Backend Architecture (Jump straight into code)

**On Screen:**
```
backend/src
├── controllers/
├── db/
├── middleware/
├── routes/
├── service/
├── types/
├── utils/
└── index.ts
```

**Script:**
"Let's jump straight into the code. The backend uses a clean layered design: thin controllers for HTTP, services for business logic and database calls, middleware for auth and validation, and utils for shared helpers. This separation keeps domain logic testable, controllers simple, and cross-cutting concerns centralized."

---

## 0:45–2:00 — Controllers and Standardized Responses

**On Screen (controller + response utils):**
```javascript
// src/controllers/productController.ts
export const getProductsController = async (req, res) => {
  try {
    const filters = parseProductFilters(req.query);
    const pg = parsePagination(req.query);

    const [items, total] = await Promise.all([
      ProductService.getProducts(filters, pg),
      ProductService.getProductCount(filters),
    ]);

    SuccessJsonResponse(res, 200, {
      products: items,
      currentPage: pg.page,
      totalPages: Math.ceil(total / pg.size),
      totalProducts: total,
      limit: pg.size,
    });
  } catch {
    ErrorJsonResponse(res, 500, "Failed to fetch products");
  }
};

// src/utils/json_mes.ts
export const SuccessJsonResponse = (res, statusCode, message) => {
  res.status(statusCode).json({ success: true, message });
};

export const ErrorJsonResponse = (res, statusCode, message) => {
  debugError(`Error ${statusCode}: ${message}`);
  res.status(statusCode).json({ success: false, message });
};
```

**Script:**
"Controllers parse inputs, call services, and return a consistent JSON shape. Pagination metadata is computed here, but data and count come from services. This uniform response contract is important because the frontend validates responses with Zod and relies on the { success, message } structure."

---

## 2:00–3:10 — Authentication + RBAC in Middleware

**On Screen:**
```javascript
// src/middleware/requireAuth.ts
export function requireAuth(required: string | string[] = []) {
  const roles = Array.isArray(required) ? required : required ? [required] : [];

  return async (req, res, next) => {
    const token = req.cookies.access_token;
    const refresh = req.cookies.refresh_token;
    if (!token) return ErrorJsonResponse(res, 401, "Unauthorized");

    let { data, error } = await supabaseClient.auth.getUser(token);

    if (error && refresh) {
      const { data: r } = await supabaseClient.auth.refreshSession({
        refresh_token: refresh,
      });
      if (r?.session) {
        res.cookie("access_token", r.session.access_token, options);
        res.cookie("refresh_token", r.session.refresh_token, options);
        data = { user: r.session.user };
      }
    }

    if (!data?.user) return ErrorJsonResponse(res, 401, "Unauthorized");

    const user = await UserService.getUserById(data.user.id, false);
    if (!user) return ErrorJsonResponse(res, 404, "User not found");

    if (roles.length && !roles.includes(user.role)) {
      return ErrorJsonResponse(res, 403, "Forbidden");
    }

    req.user_id = user.id;
    req.user_role = user.role;
    next();
  };
}
```

**Script:**
"Auth is via Supabase tokens stored in HTTP-only cookies. If the access token is expired, we refresh using the refresh token and rotate cookies server-side. We then load the user from our database to get their role. If a route requires roles, we enforce it here and attach user_id and user_role to the request."

---

## 3:10–3:50 — Validation with Zod

**On Screen:**
```javascript
// src/middleware/validation.middleware.ts
export const validateBody = (schema: z.ZodSchema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    return ErrorJsonResponse(res, 400, msg);
  }
  req.body = parsed.data;
  next();
};

// src/utils/password.ts
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;

export const passwordSchema = z
  .string()
  .regex(
    passwordRegex,
    "Password 8-20, includes upper, lower, digit, special"
  );
```

**Script:**
"All inputs are server-validated with Zod. We fail fast with detailed, field-scoped messages. Password policy is enforced on the server to guarantee strong credentials, matching the frontend's constraints."

---

## 3:50–4:40 — Services Pattern: Products (Filters + Counts)

**On Screen:**
```javascript
// src/service/products.service.ts
export const ProductService = {
  async getProducts(f, { page, size }) {
    const from = (page - 1) * size;
    const to = page * size - 1;

    const query = supabase.from("products").select("*");

    if (f.name) query.ilike("name", `%${f.name}%`);
    if (typeof f.instock === "boolean") query.eq("instock", f.instock);
    if (f.category) query.eq("category", f.category);

    const { data, error } = await query.range(from, to);
    if (error) throw error;
    return data ?? [];
  },

  async getProductCount(f) {
    const query = supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    if (f.name) query.ilike("name", `%${f.name}%`);
    if (typeof f.instock === "boolean") query.eq("instock", f.instock);
    if (f.category) query.eq("category", f.category);

    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
  },
};
```

**Script:**
"Services centralize domain logic. For products, we apply identical filters to the list and the count query so pagination stays accurate. Using the typed Supabase client keeps the code safe and concise."

---

## 4:40–5:20 — Cart → Order: Transactional Flow (Service Level)

**On Screen:**
```javascript
// src/service/orders.service.ts (outline)
export const ShoppingCartService = {
  async checkoutCart(customerId: string) {
    // 1) Read cart items for customer
    // 2) Compute total using current product prices
    // 3) Create order row (status 'pending', hub_id as needed)
    // 4) Insert order_items with price_at_order_time snapshots
    // 5) Clear the customer's cart
    // 6) Return the created order
  },
};
```

**Script:**
"The cart-to-order conversion is a service-level sequence: read the cart, compute totals, create the order, snapshot prices into order_items, and clear the cart. Supabase Postgres supports transactions; we organize steps to be idempotent and validate writes at each stage."

---

## 5:20–5:50 — File Uploads and Image Handling

**On Screen:**
```javascript
// src/middleware/upload.ts
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith("image/")
      ? cb(null, true)
      : cb(new Error("Only image files are allowed")),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// src/service/image.service.ts
export const ImageService = {
  async uploadImage(file: Express.Multer.File, folder: string) {
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
};
```

**Script:**
"We accept image uploads in memory, validate type and size, and store them in a Supabase Storage bucket. We persist only the storage path in the DB, and the frontend resolves a public URL when rendering."

---

## 5:50–6:40 — Frontend API Client: Typed Requests + Cookies + Zod

**On Screen:**
```javascript
// app/lib/api.ts
async function request<T>(
  input: RequestInfo | URL,
  schema: z.ZodType<T>,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    if (res.status === 401 && globalLogoutHandler) {
      globalLogoutHandler();
    }
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  const data = await res.json();
  const parsed = schema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.message);
  return parsed.data;
}
```

**Script:**
"All frontend API calls go through this helper. We always include credentials so the browser sends HTTP-only cookies. We validate the response with Zod before returning typed data. A 401 triggers a global logout for a clean UX."

---

## 6:40–7:20 — Route Protection Mirrors Server RBAC

**On Screen:**
```javascript
// app/routes/ProtectedRoute.tsx
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
    }
  }, [isAuthenticated, user, requiredRole, navigate]);

  if (!isAuthenticated) return <div>Loading...</div>;
  if (requiredRole && user?.role !== requiredRole)
    return <div>Access denied</div>;
  return <>{children}</>;
}
```

**Script:**
"Client-side route protection mirrors server RBAC. Unauthorized users are redirected quickly for UX, and the backend still enforces RBAC on every request."

---

## 7:20–8:00 — Redux Slices: Small, Focused, Persisted

**On Screen:**
```javascript
// app/lib/redux/auth.slice.ts
interface User {
  id: string;
  username: string;
  email: string;
  role: "customer" | "vendor" | "shipper";
  profile_picture?: string | null;
}

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null as User | null },
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
  },
});

// app/lib/redux/cart.slice.ts
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [] as CartItem[],
    lastUpdated: null as string | null,
  },
  reducers: {
    setCartItems: (s, a: PayloadAction<CartItem[]>) => {
      s.items = a.payload;
      s.lastUpdated = new Date().toISOString();
    },
    addCartItem: (s, a: PayloadAction<CartItem>) => {
      const e = s.items.find((i) => i.productId === a.payload.productId);
      if (e) {
        e.quantity += a.payload.quantity;
        e.subtotal = e.quantity * e.price;
      } else {
        s.items.push(a.payload);
      }
      s.lastUpdated = new Date().toISOString();
    },
    removeCartItem: (s, a: PayloadAction<string>) => {
      s.items = s.items.filter((i) => i.productId !== a.payload);
      s.lastUpdated = new Date().toISOString();
    },
    clearCart: (s) => {
      s.items = [];
      s.lastUpdated = new Date().toISOString();
    },
  },
});
```

**Script:**
"Redux stays minimal. We persist only auth and cart. Auth stores the user object returned by the server; sessions are owned by cookies, not local storage. Cart provides deterministic updates locally, with the server as the source of truth during checkout."

---

**Closing line (if a few seconds remain):**

"Core theme: thin controllers, strong services, Zod-validated typed boundaries on both sides, RBAC in middleware, and secure sessions with HTTP-only cookies. This yields predictable behavior and maintainable code."
