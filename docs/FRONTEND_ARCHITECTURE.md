# Frontend Architecture Overview

## Technologies, libraries, and frameworks

- **React 19 + React DOM 19**: UI library and rendering.
- **React Router v7 (SSR enabled)**: Routing, data-loading, and build tooling (`@react-router/dev`, `react-router`, `@react-router/node`, `@react-router/serve`). SSR is configured in `react-router.config.ts` with `ssr: true`.
- **Redux Toolkit + React Redux**: Global state store and bindings. Store is configured with `configureStore`, slices in `app/lib/redux/slices`.
- **redux-persist**: Persists selected slices (`auth`, `cart`) to `localStorage` via a safe SSR-aware storage shim.
- **TypeScript**: Strong typing across the app.
- **Zod**: Runtime schema validation and parsing for API responses and form data.
- **Tailwind CSS v4**: Styling, integrated via Vite plugin `@tailwindcss/vite` and configured in `components.json` to use `app/app.css`.
- **shadcn/ui + Radix UI**: Accessible UI primitives and icons (`~/components/ui/*`, `@radix-ui/*`, `lucide-react`).
- **sonner**: Toast notifications.
- **Vite 6**: Dev server and build tool with `vite-tsconfig-paths`.

## File and folder organization

- `frontend/app/`

  - `root.tsx`: App shell, SSR document, providers setup (`Redux Provider`, `PersistGate`, `ThemeProvider`), global toast, error boundary, and global logout wiring.
  - `app.css`: Global Tailwind styles.
  - `components/`
    - `layout/` (`Header.tsx`, `Footer.tsx`)
    - `home/` (`interactive-feature-cards.tsx`)
    - `ui/`: shadcn components (button, card, dialog, table, etc.)
    - `shared/` (`Field.tsx`)
  - `lib/`
    - `api.ts`: Typed API client wrappers with Zod parsing, cookie-based auth (`credentials: include`), and centralized 401 handling via a global logout handler.
    - `auth.ts`, `cart.ts`: Facade re-exports of Redux hooks/types for usage in routes/components.
    - `redux/`
      - `store.ts`: Configures persisted store, SSR-safe storage, and middleware settings.
      - `slices/` (`authSlice.ts`, `cartSlice.ts`): Auth and cart reducers/actions/selectors; `cartSlice` includes an async thunk `fetchCart`.
      - `authHooks.ts`, `cartHooks.ts`, `hooks.ts`: Typed hooks composing Redux logic (login/logout and cart operations, including optimistic updates and backend sync).
    - `schemas.ts`: Zod DTO schemas for API responses (products, orders, auth).
    - `validators.ts`: Zod validation for forms (login/register/product/checkout/cart).
    - `theme.tsx`: Theme context with localStorage + system preference support.
    - `utils.ts`: General utilities (e.g., product categories).
  - `routes.ts`: Route map for React Router (home, about, privacy, help; auth; account; customer; vendor; shipper).
  - `routes/`: Route modules per page (e.g., `customer/products.tsx`, `vendor/products.tsx`, `shipper/orders.tsx`, etc.).

- `frontend/vite.config.ts`: Vite config with Tailwind and React Router plugins.
- `frontend/react-router.config.ts`: Enables SSR.
- `frontend/components.json`: shadcn setup and path aliases (`~/components`, `~/lib`, etc.).

## API routes, data flow, and state management

### API base and conventions

- Base URL: `http://localhost:5000/api` (cookie-auth; `credentials: 'include'`).
- All request helpers parse responses with Zod and throw on validation error. A shared `request()` adds `Content-Type: application/json` for JSON requests and triggers a global logout callback on 401s (except for login/register/logout which use direct `fetch`).

### Key API functions (`app/lib/api.ts`)

- **Products**:
  - `fetchProducts({ page, size, category, priceMin, priceMax, name })` → `{ products, currentPage, totalPages, totalProducts, limit }`.
  - `fetchProduct(productId)` → product.
  - `fetchVendorProducts(params)` → vendor’s products.
- **Cart**:
  - `fetchCartApi({ page, size })` → `{ items, count, page, size }`.
  - `addToCartApi(productId, quantity)` → `{ success, item }`.
  - `deleteCartItemApi(productId)` → `{ success, removed?, id? }`.
  - `checkoutCartApi()` → `{ success, order, message }`.
- **Auth**:
  - `loginApi(credentials)` → `LoginDto`.
  - `logoutApi()` → `{ success, message? }`.
  - `registerCustomerApi`, `registerVendorApi`, `registerShipperApi`.
- **Orders/Shipper**:
  - `fetchOrdersByHub()` → shipper’s orders.
  - `fetchOrder(orderId)` → order.
  - `updateOrderStatusApi(orderId, status)`.
  - `fetchOrderItemsApi(orderId)` → order items with customer info.
- **Users & hubs**:
  - `fetchUsersApi`, `fetchUserByIdApi`, `deleteUserApi`, `updatePasswordApi`.
  - `fetchDistributionHubsApi`.

### Data flow and global logout

- `root.tsx` sets `setGlobalLogoutHandler` to perform a full client logout (call `logoutApi`, clear Redux auth/cart, navigate to `/`). The shared `request()` calls this handler automatically on 401, ensuring a consistent UX when sessions expire.

### State management

- **Store** (`redux/store.ts`):
  - Combines `auth` and `cart` reducers, persists via `redux-persist` with an SSR-safe `Storage` shim (no direct `localStorage` on server).
  - Enables Redux DevTools outside production and configures serializable check to ignore `redux-persist` actions.
- **Auth slice** (`redux/slices/authSlice.ts`):
  - `login`, `logout` reducers; selectors `selectUser`, `selectIsAuthenticated`.
  - `useAuth()` hook wraps dispatch/selectors, and on logout also clears cart + sync flags.
- **Cart slice** (`redux/slices/cartSlice.ts`):
  - Local cart structure with `items`, `isLoading`, `isSync`, `lastSynced`, `error`.
  - Actions: `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `setSyncStatus`, `clearError`.
  - Thunks: `fetchCart` consumes `fetchCartApi` and normalizes backend cart lines into the local `CartItem` shape.
  - Selectors: totals, loading, sync, lastSynced.
  - `useCart()` hook implements:
    - On login: auto-fetch cart if empty; otherwise sync local items lacking backend IDs, then refresh from server.
    - Optimistic updates for add/remove/update; when authenticated, syncs to backend via `addToCartApi`/`deleteCartItemApi` and refreshes; when guest, stays local.
    - `forceSync()` to push local unsynced items to server and reload.

### Routing and pages

- Routes are declared in `app/routes.ts` and compiled by React Router build tooling. SSR document and nested outlets are defined in `app/root.tsx`.
- Role-based UX in routes/components reads from `useAuth()` (e.g., home CTAs, guarded flows in account/vendor/shipper areas).

### Theming and UI

- `ThemeProvider` manages light/dark mode with system preference fallback and persists to `localStorage`.
- UI components come from shadcn/Radix; path aliases enable concise imports like `~/components/ui/button`.

### Error handling and UX

- API helpers throw on network/validation errors; pages/hooks catch and surface errors via `sonner` toasts where appropriate.
- `ErrorBoundary` in `root.tsx` renders user-friendly error pages and shows stack in dev.
