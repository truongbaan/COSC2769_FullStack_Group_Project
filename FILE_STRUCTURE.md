## Project file structure

This document provides a high-level overview of the repository layout and the purpose of the main files and directories for both the frontend (React + Vite) and backend (Node + TypeScript + Express).

---

## Root

- `docker-compose.yml`: Orchestration for multi-container development (frontend + backend).
- `Dockerfile`: Root-level Dockerfile (may be used for aggregate or deployment images).
- `package.json`, `package-lock.json`: Root-level package metadata (if used for tooling at the root).
- `README.md`: Root project overview.
- `COMPLETE_API_DOCUMENTATION.md`: Consolidated backend API reference.
- `note.txt`: Miscellaneous notes.
- `backend/`: Backend service.
- `frontend/`: Frontend web app.

---

## Backend (`backend/`)

Node.js + TypeScript + Express API server.

- `Dockerfile.backend`: Dockerfile for the backend service.
- `backend.api.md`: Human-readable API notes.
- `package.json`, `package-lock.json`: Backend dependencies and scripts.
- `tsconfig.json`: TypeScript configuration for backend build.
- `note.txt`: Miscellaneous notes.
- `src/`: TypeScript source code.
  - `index.ts`: Express app bootstrap (server entry), sets up middleware and mounts routers.
  - `db/`
    - `db.ts`: Database connection and query layer (likely using a client/ORM).
  - `controllers/`: Request handlers; orchestrate services and shape responses.
    - `auth.controller.ts`: Login/register/logout endpoints.
    - `customer.controller.ts`: Customer operations.
    - `getDistributionHubsController.ts`: Distribution hubs listing for shippers/vendors.
    - `orderController.ts`: Orders lifecycle endpoints.
    - `orderItemController.ts`: Items within orders.
    - `productController.ts`: Product CRUD and queries.
    - `shipper.controller.ts`: Shipper operations.
    - `shoppingCartController.ts`: Cart operations (add/remove/checkout).
    - `user.controller.ts`: User profile and management.
    - `vendor.controller.ts`: Vendor-specific operations.
  - `routes/`: Express routers; map URLs to controllers.
    - `router.ts`: Root router aggregator.
    - `auth.router.ts`, `customer.router.ts`, `distribution_hubs.router.ts`, `order_items.router.ts`, `orders.router.ts`, `products.router.ts`, `shipper.router.ts`, `shopping_cart_items.router.ts`, `user.router.ts`, `vendor.router.ts`.
  - `service/`: Business logic and data access.
    - `auth.service.ts`: Auth flows (hashing, tokens, sessions).
    - `customer.service.ts`, `vendor.service.ts`, `shipper.service.ts`: Role-specific logic.
    - `products.service.ts`: Product queries and mutations.
    - `orders.service.ts`, `order_items.service.ts`: Order domain logic.
    - `shopping_carts.service.ts`: Cart domain logic.
    - `distribution_hubs.service.ts`: Hubs data.
    - `image.service.ts`: Image upload/processing.
    - `user.service.ts`: User operations.
  - `middleware/`
    - `requireAuth.ts`: Auth guard middleware.
    - `validation.middleware.ts`: Request validation handler.
  - `types/`
    - `general.type.ts`: Shared backend TypeScript types.
  - `utils/`
    - `generator.ts`: ID/slug/token generators.
    - `json_mes.ts`: JSON response helpers.
    - `password.ts`: Password hashing/verification.

---

## Frontend (`frontend/`)

React + Vite application with Redux Toolkit and redux-persist.

- `Dockerfile`: Dockerfile for the frontend service.
- `package.json`, `package-lock.json`: Frontend dependencies and scripts.
- `tsconfig.json`: TypeScript configuration for the frontend.
- `vite.config.ts`: Vite build and dev server config.
- `components.json`: UI library config (e.g., shadcn components).
- `README.md`: Frontend-specific instructions.
- `API_Documentation.md`: API reference targeted to the frontend.
- `Lazada E-Commerce Project Description.md`, `2025B Project Description Group.pdf`: Project brief.
- `public/`
  - `favicon.ico`: App icon assets.
- `react-router.config.ts`: Router configuration (route types/introspection).
- `REDUX.md`: Detailed Redux architecture and usage guide.
- `app/`: Application source code.
  - `root.tsx`: Application root; mounts Redux Provider and PersistGate, sets global logout handler, renders layout shell.
  - `app.css`: Global styles.
  - `routes.ts`: Route descriptors or shared route helpers.
  - `components/`: UI and layout components.
    - `layout/`: Global layout components.
      - `Header.tsx`, `Footer.tsx`: App header/footer.
    - `home/`: Landing page components.
      - `interactive-feature-cards.tsx`: Home page interactive UI.
    - `shared/`: Small shared building blocks.
      - `Field.tsx`: Form field wrapper.
    - `ui/`: Reusable UI primitives (shadcn-like): `button.tsx`, `card.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `form.tsx`, `input.tsx`, `label.tsx`, `pagination.tsx`, `select.tsx`, `separator.tsx`, `sonner.tsx`, `table.tsx`, `tabs.tsx`, `textarea.tsx`, `accordion.tsx`, `avatar.tsx`, `badge.tsx`, `icons.tsx`.
  - `routes/`: Route modules (React Router data-router style).
    - `home.tsx`, `about.tsx`, `help.tsx`, `privacy.tsx`.
    - `auth/`: Authentication pages.
      - `login.tsx`, `register.tsx`.
    - `account/`: User account screens.
      - `profile.tsx`: User profile with image upload and password update.
    - `customer/`: Customer flows.
      - `products.tsx`: Product listing with filters/search and add-to-cart.
      - `product-detail.tsx`: Product detail page.
      - `cart.tsx`: Shopping cart UI and checkout.
    - `vendor/`: Vendor dashboards.
      - `add-product.tsx`: Create product (image upload, form).
      - `products.tsx`: Vendor product management.
      - `cart.tsx`: (Vendor-specific cart if applicable.)
    - `shipper/`: Shipper dashboards.
      - `orders.tsx`: Orders by hub.
      - `order-detail.tsx`: Order detail and status updates.
  - `lib/`: Frontend libraries and state.
    - `api.ts`: API client with zod validation and global 401 handling.
    - `schemas.ts`: Zod schemas and DTO types.
    - `validators.ts`: Form/input validators (zod).
    - `utils.ts`: UI/formatting utilities.
    - `auth-storage.ts`: Auth-related local storage helpers.
    - `auth.ts`, `auth-redux.ts`: Re-export `useAuth` hook and types for simpler imports.
    - `cart.ts`, `cart-redux.ts`: Re-export `useCart` hook and types.
    - `redux/`: Redux Toolkit setup.
      - `store.ts`: Configured store, SSR-safe persistence, `persistor`, types.
      - `hooks.ts`: Typed hooks (`useAppDispatch`, `useAppSelector`).
      - `slices/`
        - `authSlice.ts`: Auth state/actions/selectors.
        - `cartSlice.ts`: Cart state/thunk/actions/selectors.
      - `authHooks.ts`: `useAuth` domain hook (login/logout, session effects).
      - `cartHooks.ts`: `useCart` domain hook (optimistic updates, syncing).

### Frontend routes: role-based access

| Path                   | Page            | Guest | Customer | Vendor   | Shipper  | Notes                                                         |
| ---------------------- | --------------- | ----- | -------- | -------- | -------- | ------------------------------------------------------------- |
| `/`                    | Home            | Yes   | Yes      | Yes      | Yes      | Role-specific CTAs shown                                      |
| `/about`               | About           | Yes   | Yes      | Yes      | Yes      | Public                                                        |
| `/help`                | Help            | Yes   | Yes      | Yes      | Yes      | Public                                                        |
| `/privacy`             | Privacy         | Yes   | Yes      | Yes      | Yes      | Public                                                        |
| `/login`               | Login           | Yes   | Redirect | Redirect | Redirect | Authenticated users are redirected to `/account`              |
| `/register/:role?`     | Register        | Yes   | Redirect | Redirect | Redirect | Authenticated users are redirected to `/account`              |
| `/account`             | Profile         | Redirect | Yes    | Yes      | Yes      | Requires authentication                                       |
| `/products`            | Product list    | Yes   | Yes      | Redirect | Redirect | Logged-in vendors/shippers are redirected to their dashboards |
| `/products/:productId` | Product detail  | Redirect | Yes    | Redirect | Redirect | Requires login; vendors/shippers are redirected               |
| `/cart`                | Cart            | Yes   | Yes      | Yes      | Yes      | Checkout requires login; designed for customers               |
| `/vendor/products`     | Vendor products | Redirect | Redirect | Yes    | Redirect | Requires vendor role                                          |
| `/vendor/products/new` | Add product     | Redirect | Redirect | Yes    | Redirect | Requires vendor role                                          |
| `/shipper/orders`      | Shipper orders  | Redirect | Redirect | Redirect | Yes  | Requires shipper role                                         |
| `/shipper/orders/:orderId` | Shipper order detail | Redirect | Redirect | Redirect | Yes | Requires shipper role; hub validated in page                  |

---

## How the pieces fit

- Frontend uses `app/root.tsx` to mount Redux and bootstrap global session handling. Feature hooks in `lib/redux` encapsulate domain flows (auth, cart) over the slices and API layer.
- Backend exposes REST endpoints consumed by `frontend/app/lib/api.ts`. Controllers map routes to services; services encapsulate business logic and talk to the DB layer.
- `docker-compose.yml` coordinates running both services together for development.

---

## Adding new features (at a glance)

Backend:

- Add controller/service functions and wire a router in `backend/src/routes`.
- Share types in `backend/src/types` when helpful.

Frontend:

- Add a route under `frontend/app/routes` or a component under `frontend/app/components`.
- For stateful features, create a new slice in `frontend/app/lib/redux/slices`, register it in `store.ts`, optionally add a domain hook next to existing ones.
