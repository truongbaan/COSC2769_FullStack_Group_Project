## Redux architecture and usage (frontend)

This project uses Redux Toolkit with typed hooks and redux-persist for durable client state. The Redux layer is intentionally thin; domain logic (e.g., auth, cart synchronization) is encapsulated in feature hooks to keep components simple.

### TL;DR quick start

- Wrap the app once in the Redux Provider and PersistGate (done in `app/root.tsx`).
- Use domain hooks for most interactions:
  - `useAuth()` for login/logout and user info.
  - `useCart()` for reading items/totals and mutating the cart.
- If you need low-level access, use typed hooks:
  - `useAppDispatch()` and `useAppSelector()` from `lib/redux/hooks`.

---

## Store and persistence

- **File**: `app/lib/redux/store.ts`
- **Technologies**: Redux Toolkit `configureStore`, `combineReducers`; `redux-persist` for persistence.

Key points:

- **SSR-safe storage**: `createSafeStorage()` wraps `window.localStorage` when available and falls back to a no-op async storage on the server. This prevents "window is not defined" during SSR and lets rehydration succeed on the client.
- **Persist configuration**: Only `auth` and `cart` slices are persisted.
- **DevTools**: Enabled when `NODE_ENV !== 'production'`.
- **Types**: `RootState` and `AppDispatch` exported for typed hooks and selectors.

```ts
// Simplified sketch (see app/lib/redux/store.ts)
const persistConfig = {
  key: "root",
  storage: createSafeStorage(),
  whitelist: ["auth", "cart"],
};

const rootReducer = combineReducers({ auth: authSlice, cart: cartSlice });
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (gDM) =>
    gDM({
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
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

Provider integration lives in `app/root.tsx`:

```tsx
// app/root.tsx (excerpt)
<Provider store={store}>
  <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
    <AppContent />
  </PersistGate>
</Provider>
```

### Typed hooks

- **File**: `app/lib/redux/hooks.ts`
- Replace raw `useDispatch` and `useSelector` with:
  - `useAppDispatch()` → typed `AppDispatch`
  - `useAppSelector` → typed `RootState`

These ensure compile-time safety for selectors and dispatched actions.

---

## Slices

### Auth slice

- **File**: `app/lib/redux/slices/authSlice.ts`
- **State**:
  - `user: User | null`
  - `User` includes `id`, `username`, `email`, optional role-specific fields and UI fields (`avatarUrl`).
- **Reducers**:
  - `login(User)` → sets `state.user`
  - `logout()` → clears `state.user`
- **Selectors**:
  - `selectUser(state)`
  - `selectIsAuthenticated(state)`

Usage via domain hook (preferred): `useAuth()` (see below).

### Cart slice

- **File**: `app/lib/redux/slices/cartSlice.ts`
- **State**:
  - `items: CartItem[]` where `CartItem = { product: ProductDto; quantity: number; id?: string }`
  - `isLoading: boolean`, `isSync: boolean`, `lastSynced?: string`, `error?: string`
- **Async thunk**:
  - `fetchCart` → GETs the server cart and normalizes items into frontend `CartItem` shape.
- **Reducers**:
  - `addItem({ product, quantity? })` → adds or increments
  - `removeItem(productId)` → remove by product id
  - `updateQuantity({ productId, quantity })` → set or remove when 0/less
  - `clearCart()` → local clear
  - `setSyncStatus(boolean)` → marks client↔server sync state
  - `clearError()`
- **Extra reducers** handle `fetchCart/pending|fulfilled|rejected` and set `items`, `isLoading`, `isSync`, timestamps, and errors.
- **Selectors**:
  - `selectCartItems`, `selectCartLoading`, `selectCartSync`, `selectCartError`, `selectCartLastSynced`
  - `selectTotalItems` (sum of quantities)
  - `selectTotalPrice` (sum of `price × quantity`)

---

## Domain hooks (feature logic)

Domain hooks wrap the store, actions, and APIs into cohesive feature behaviors. Prefer these in UI components.

### `useAuth`

- **File**: `app/lib/redux/authHooks.ts` (re-exported from `app/lib/auth.ts` and `app/lib/auth-redux.ts`)
- **Returns**: `{ user, login, logout, isAuthenticated }`
- **Side effects**:
  - On `logout()`, also clears the cart and marks it unsynced (`clearCart()`, `setSyncStatus(false)`). This avoids stale cart counts after logout.

Example:

```tsx
import { useAuth } from "~/lib/auth";

function ProfileButton() {
  const { user, logout, isAuthenticated } = useAuth();
  if (!isAuthenticated()) return null;
  return <button onClick={logout}>Logout {user?.username}</button>;
}
```

### `useCart`

- **File**: `app/lib/redux/cartHooks.ts` (re-exported from `app/lib/cart.ts` and `app/lib/cart-redux.ts`)
- **Reads**: `items`, `isLoading`, `isSync`, `error`, `lastSynced`, totals helpers
- **Mutations**: `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `forceSync`
- **Auto-sync on login**:
  - If a user logs in and local cart is empty → `fetchCart()` from server.
  - If local cart has items without backend IDs → POST each to server via `addToCartApi`, then `fetchCart()`.
- **Optimistic updates**:
  - `addItem`/`removeItem`/`updateQuantity` first update local state for instant UX.
  - If authenticated, they sync to backend and then refresh using `fetchCart()` to reconcile exact server state/IDs.
  - Errors show a toast (`sonner`) and attempt to re-fetch to reduce drift.

Example (add to cart):

```tsx
import { useCart } from "~/lib/cart";
import type { ProductDto } from "~/lib/schemas";

function AddToCartButton({ product }: { product: ProductDto }) {
  const { addItem } = useCart();
  return <button onClick={() => addItem(product, 1)}>Add to cart</button>;
}
```

Example (cart totals):

```tsx
import { useCart } from "~/lib/cart";

function CartIcon() {
  const { getTotalItems } = useCart();
  return <span>{getTotalItems()}</span>;
}
```

---

## API integration and global logout

- **File**: `app/lib/api.ts`
- **Request helper**: All requests include credentials and JSON headers. On non-OK, it throws with response details.
- **401 handling**: The shared `request()` detects `401` and, if a global logout handler is set, calls it to centralize session-expiration behavior.
- **Global logout wiring**: In `app/root.tsx`, the app sets a global handler using `setGlobalLogoutHandler` that:
  1. Calls `logoutApi()` to invalidate the server session.
  2. Dispatches local `logout()` via `useAuth()` (which also clears the cart).
  3. Redirects the user to `/`.

```tsx
// app/root.tsx (excerpt)
useEffect(() => {
  setGlobalLogoutHandler(async () => {
    try {
      await logoutApi();
    } finally {
      logout();
      navigate("/");
    }
  });
  return () => {
    clearGlobalLogoutHandler();
  };
}, [logout, navigate]);
```

---

## Persistence and SSR behavior

- **SSR-safe localStorage**: `createSafeStorage()` returns a storage interface compatible with `redux-persist` but falls back to a no-op storage on the server. This prevents SSR crashes and defers rehydration until the client.
- **Whitelist**: Only `auth` and `cart` are persisted.
- **Rehydration**: UI is gated by `<PersistGate>` which shows a fallback until the persisted state is fully rehydrated.
- **Maintenance**: If you need to clear persisted state during development, you can call `persistor.purge()` (exported from `store.ts`) or clear localStorage in your browser.

---

## Using Redux in components

Prefer the domain hooks. For low-level cases:

```tsx
import { useAppDispatch, useAppSelector } from "~/lib/redux/hooks";
import { selectUser } from "~/lib/redux/slices/authSlice";

function Example() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  // dispatch(someAction())
  return <div>{user?.username}</div>;
}
```

---

## Extending the Redux layer

1. Create a slice under `app/lib/redux/slices/yourSlice.ts` using `createSlice`:

```ts
import { createSlice } from "@reduxjs/toolkit";

interface FeatureState {
  value: number;
}
const initialState: FeatureState = { value: 0 };

const featureSlice = createSlice({
  name: "feature",
  initialState,
  reducers: {
    increment: (s) => {
      s.value += 1;
    },
  },
});

export const { increment } = featureSlice.actions;
export default featureSlice.reducer;
```

2. Register it in `app/lib/redux/store.ts`:

- Add to `combineReducers({ ... })`.
- If it should persist, add its key to `persistConfig.whitelist`.

3. (Optional) Provide a domain hook like `useFeature()` to orchestrate any side effects and provide a clean API for components.

4. Add typed selectors in the slice file where appropriate to avoid duplicating logic in components.

---

## File map (Redux-related)

- `app/lib/redux/store.ts`: Store, persistence, types, `persistor` export.
- `app/lib/redux/hooks.ts`: Typed `useAppDispatch` / `useAppSelector`.
- `app/lib/redux/slices/authSlice.ts`: Auth state, actions, selectors.
- `app/lib/redux/slices/cartSlice.ts`: Cart state, async thunk, actions, selectors.
- `app/lib/redux/authHooks.ts`: `useAuth` domain hook; also re-exported from `app/lib/auth.ts` and `app/lib/auth-redux.ts`.
- `app/lib/redux/cartHooks.ts`: `useCart` domain hook; also re-exported from `app/lib/cart.ts` and `app/lib/cart-redux.ts`.
- `app/root.tsx`: Provider, PersistGate, global logout wiring.
- `app/lib/api.ts`: API helpers, global 401 handling, cart/auth endpoints.

---

## Common pitfalls and tips

- **Prefer domain hooks** (`useAuth`, `useCart`) over manual action dispatching in components. They encapsulate synchronization and error handling.
- **Optimistic updates** are used for cart actions. Always plan for eventual reconciliation with the server (`fetchCart()` is called by the hook).
- **Avoid duplicating selectors** in components. Use exported selectors or simple helpers returned by hooks (`getTotalItems`, `getTotalPrice`).
- **Persistence**: When debugging odd state after code changes, purge storage or bump the persist `key`.
- **SSR**: If you ever access `window` from Redux code, guard it; the store already guards storage, follow the same pattern elsewhere.

---

## Examples

Add to cart from a product card:

```tsx
import { useCart } from "~/lib/cart";

export function ProductCard({ product }: { product: ProductDto }) {
  const { addItem } = useCart();
  return <button onClick={() => addItem(product, 1)}>Add</button>;
}
```

Protect a route by role:

```tsx
import { useAuth } from "~/lib/auth";

export function VendorOnly({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated() || user?.role !== "vendor") return null; // or redirect
  return <>{children}</>;
}
```

Purge persisted state during development:

```ts
import { persistor } from "~/lib/redux/store";
await persistor.purge();
```

---

