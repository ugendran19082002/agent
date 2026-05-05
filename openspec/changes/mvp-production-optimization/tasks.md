## 1. Redis Caching Layer

- [x] 1.1 Create `backend/src/services/cache/CacheService.js` with `getOrSet(key, ttlSeconds, fetchFn)`, `invalidate(key)`, and `invalidatePattern(pattern)` — reuse the existing `ioredis` instance from `backend/src/queue/index.js`; prefix all keys with `cache:`; wrap every Redis call in try/catch and log `CACHE0001` + fallback to `fetchFn` on error
- [x] 1.2 Migrate `SystemSettingsService.js` to call `CacheService.getOrSet('sys_setting:{key}', 300, ...)` instead of the in-process `Map`; remove the `Map` and the 30-second TTL logic; call `CacheService.invalidate` from the admin settings update path
- [x] 1.3 Wrap `ShopService.getNearbyShops` result in `CacheService.getOrSet('shop_discovery:{lat6}:{lng6}:{radius}', 60, ...)` where coordinates are rounded to 6 decimal places; call `CacheService.invalidatePattern('cache:shop_discovery:*')` in the shop status toggle and shop approval handlers
- [x] 1.4 Cache user COD/trust profile reads in `CacheService.getOrSet('user_trust:{userId}', 120, ...)` at the point where order placement validates `users.cod_blocked`; call `CacheService.invalidate('cache:user_trust:{userId}')` whenever COD control fields are updated in `OrderCancellationService` and `DeliveryService`
- [x] 1.5 Add `DISABLE_CACHE=true` env-flag check inside `CacheService.getOrSet` that bypasses Redis and calls `fetchFn` directly (for local dev and rollback)

## 2. OrderService Decomposition

- [x] 2.1 Create `backend/src/services/order/OrderPlacementService.js` — extract `placeOrder` and all private helpers it depends on (checkout guards, deposit logic, loyalty redemption, coupon application, price breakdown, Razorpay order creation, inventory reservation); file must be ≤ 600 lines
- [x] 2.2 Create `backend/src/services/order/OrderCancellationService.js` — extract `restoreOrderPlacementSideEffects`, before/after-pickup cancellation logic, UPI tiered refund calculation, COD control updates, return-to-shop trigger, and `initiatePrepaidRefundFullCancel`; file must be ≤ 500 lines
- [x] 2.3 Create `backend/src/services/order/OrderSwitchService.js` — extract `findBestShop`, `findMatchedProductForSwitch`, `accumulateSwitchLineTotals`, `computeSwitchOrderTotal`, and switch-shop confirmation logic; file must be ≤ 400 lines
- [x] 2.4 Create `backend/src/services/order/OrderQueryService.js` — extract `shopHasInventoryForOrderItems`, order-history retrieval, order-detail fetch, and order-status-log queries; file must be ≤ 300 lines
- [x] 2.5 Rewrite `OrderService.js` as a facade that re-exports all named exports from the four new sub-service files; verify no controller import changes are required by running `grep -r "from.*OrderService" backend/src/` and confirming all imports still resolve
- [x] 2.6 Run the existing test suite after decomposition and confirm zero regressions; run `node --check` on each new file to catch syntax errors

## 3. Observability and Logging

- [x] 3.1 Create `backend/src/middleware/correlationId.js` — read `X-Request-ID` header (accept if valid UUID, otherwise `crypto.randomUUID()`); set `req.correlationId`; set `X-Request-ID` response header
- [x] 3.2 Mount `correlationId` middleware as the first middleware in `backend/src/app.js` (before JWT, before routes)
- [x] 3.3 Update the 5 highest-traffic controllers (`order.controller.js`, `DeliveryController.js`, `auth.controller.js`, `shop.controller.js`, `admin.controller.js`) to use `logger.child({ correlationId: req.correlationId })` for all log calls within the request handler
- [x] 3.4 Update `addJob` in `backend/src/queue/index.js` to accept an optional `correlationId` parameter and include it in the job data object; update call sites in the 5 controllers above to pass `req.correlationId`
- [x] 3.5 Create `GET /health` Express route (no auth) returning `{ status, db, redis, queue }` with HTTP 200 or 503; mount it before JWT middleware in `app.js`
- [x] 3.6 Create `GET /ready` Express route (no auth) that returns 200/`{ ready: true }` after DB and Redis have connected, 503/`{ ready: false }` before; set a module-level `isReady` flag in `app.js` that is flipped to `true` inside the startup sequence after `checkConnection()` and Redis ping succeed

## 4. Pagination Standardization

- [x] 4.1 Create `backend/src/middleware/pagination.js` — parse `?page` and `?limit` query params; coerce to positive integers; cap `limit` at 100; default to `page=1, limit=20`; attach `req.pagination = { page, limit, offset }` to the request
- [x] 4.2 Apply `paginationMiddleware` to `GET /api/v1/admin/shops`, `GET /api/v1/admin/complaints`, `GET /api/v1/admin/coupons` routes and update their controllers to use `req.pagination` for Sequelize `limit`/`offset` and to return `{ data, total, page, limit }`
- [x] 4.3 Apply `paginationMiddleware` to `GET /api/v1/shop-owner/orders`, `GET /api/v1/shop-owner/customers` routes and update their controllers
- [x] 4.4 Apply `paginationMiddleware` to `GET /api/v1/orders` (customer order history) and `GET /api/v1/delivery/orders` routes and update their controllers
- [x] 4.5 Update frontend API helpers in `frontend/api/` for each affected endpoint to pass `page` and `limit` params and to destructure `{ data, total, page, limit }` from the response instead of a raw array

## 5. Frontend Render Optimization

- [x] 5.1 Add `getItemLayout` (height 120 dp) and wrap `ShopCard` in `React.memo` on the Customer Home shop `FlatList`
- [x] 5.2 Add `getItemLayout` (height 88 dp) and wrap the order history row component in `React.memo` on `app/customer/order-history.tsx` (or equivalent)
- [x] 5.3 Add `getItemLayout` using measured `ListHeaderComponent` layout plus `DELIVERY_TRIP_ROW_HEIGHT` (392 dp card stride) and scroll-content gap (`tripListRowStride`), with pending-trip rows wrapped in `React.memo` on the Delivery Dashboard pending list
- [x] 5.4 Wrap the Admin Shop List row component in `React.memo` and add `getItemLayout` (height 64 dp)
- [x] 5.5 Replace all `<Image>` imports from `react-native` with `<Image>` from `expo-image` in the following screens: Customer Home shop list, Shop Detail product list, Order History list, Delivery Dashboard, and Admin Shop List; set `contentFit="cover"` on card images
- [x] 5.6 Implement `onEndReached` load-more pagination on Customer Home shop list, Order History, and Admin Shop List screens to consume the paginated API responses from task 4.5; append new pages to Zustand list state; stop fetching when `data.length >= total`

## 6. Checkout Service Boundary Update

- [x] 6.1 Verify that after task 2.5 (facade), `app/api/orderApi.ts` and `checkout.tsx` still work end-to-end: the frontend's `POST /api/v1/orders` call hits the controller which now delegates to `OrderPlacementService.placeOrder` — confirm the response shape is unchanged by running a full checkout flow in the dev environment

## 7. Verification

- [x] 7.1 Verify Redis caching: run `redis-cli MONITOR` during a shop-discovery request and confirm cache hit on second identical request; confirm `sys_setting:*` keys expire after 300 seconds
- [x] 7.2 Verify OrderService facade: run `grep -r "from.*OrderService" backend/src/controllers/` and confirm no import changes; run full order placement and cancellation flows without errors
- [x] 7.3 Verify pagination: call `GET /api/v1/admin/shops?page=1&limit=5` and confirm response shape is `{ data, total, page, limit }` with at most 5 records; call without params and confirm defaults (page 1, limit 20)
- [x] 7.4 Verify correlation IDs: make a test request with `X-Request-ID: test-uuid-1234` and confirm the same header appears in the response and in the log entry for that request
- [x] 7.5 Verify health endpoint: call `GET /health` with DB and Redis running — expect HTTP 200 `{ status: "ok", db: true, redis: true, queue: true }`; call `GET /ready` before startup completes — expect HTTP 503
- [x] 7.6 Verify frontend FlatList performance: open Customer Home on a device with React DevTools Profiler; confirm `ShopCard` components do not re-render when the search bar input changes
- [x] 7.7 Verify `expo-image` replacement: confirm list thumbnail images load from cache on the second visit (no new network request visible in Metro / Expo logs)
- [x] 7.8 Verify load-more pagination: scroll to the bottom of Order History with more than 20 orders; confirm page 2 is fetched and appended without replacing page 1 results

## 8. Testing Infrastructure — Tooling Setup

- [x] 8.1 Add `jest.config.js` to `backend/` with `testEnvironment: 'node'`, `testMatch` patterns for `unit`, `integration`, and `e2e` subdirectories under `backend/src/tests/`, and `coverageThreshold` set to 70% lines on `backend/src/services/**`
- [x] 8.2 Add `test:unit`, `test:integration`, `test:e2e`, and `test` scripts to `backend/package.json`; install `jest`, `supertest`, and `@jest/globals` as devDependencies if not present
- [x] 8.3 Add `jest.config.js` to `frontend/` using the `jest-expo` preset; configure module name mapper for path aliases and mock files for native modules (`react-native-maps`, `expo-camera`, etc.); set `coverageThreshold` to 60% lines on `frontend/utils/**` and `frontend/stores/**`
- [x] 8.4 Add `test:unit`, `test:integration`, `test:e2e`, and `test` scripts to `frontend/package.json`; install `@testing-library/react-native`, `@testing-library/jest-native`, and `jest-expo` as devDependencies if not present
- [x] 8.5 Create `e2e/` directory at repo root; initialise Detox config (`e2e/.detoxrc.js`) targeting iOS simulator and Android emulator debug builds; add `test:e2e` script to root `package.json`

## 9. Testing Infrastructure — Backend Unit Tests

- [x] 9.1 Write unit tests for `OrderPlacementService` covering: successful price breakdown calculation, pending-can block enforcement, COD-blocked guard, and idempotency key duplicate detection; mock Sequelize models and `CacheService`
- [x] 9.2 Write unit tests for `OrderCancellationService` covering: before-pickup 100% refund path, all 4 UPI tiered refund percentages (0/10/60/100%), and COD `cod_failed_count` increment logic; mock `RefundRulesService` and `NotificationService`
- [x] 9.3 Write unit tests for `RefundRulesService` covering: each cancellation tier boundary (`cancellation_count_30d` = 0, 1, 2, ≥ 3) and the deposit-refund-separate rule
- [x] 9.4 Write unit tests for `CanService` covering: `checkoutDepositLogic` returns 0 when `pending_cans = 0`, positive deposit when `pending_cans > 0`, and the balance-below-zero guard in `incrementCansReturned`
- [x] 9.5 Write unit tests for `LoyaltyService` covering: spend-based point earning (10 pts per ₹100), tier-multiplier application, 6-month expiry cron logic, and point reversal on cancellation
- [x] 9.6 Write unit tests for `SystemSettingsService` covering: cache hit returns cached value without DB call, cache miss calls DB and stores result, `invalidateCache` removes the key, and Redis-unavailable fallback (with `CacheService` mocked)

## 10. Testing Infrastructure — Backend Integration Tests

- [x] 10.1 Create `backend/src/tests/integration/setup.js` that connects to the test database (`TEST_DB_*` env vars), runs Sequelize sync, and seeds a minimal test user (customer + shop + delivery person) before each suite; tears down after
- [x] 10.2 Write integration tests for auth routes: `POST /api/v1/auth/check-phone` (exists / not exists), `POST /api/v1/auth/login` (valid PIN → JWT, invalid PIN → 401, lockout after 3 failures)
- [x] 10.3 Write integration tests for `POST /api/v1/orders`: valid placement returns `201` with order ID and price breakdown; pending-can block returns `403`; missing `Idempotency-Key` header returns `400`; duplicate key within 10 min returns same order ID
- [x] 10.4 Write integration tests for `PUT /api/v1/orders/:id/cancel`: before-pickup cancel returns `200` and sets order status to `cancelled`; after-pickup cancel returns `200` and sets status to `return_to_shop`
- [x] 10.5 Write integration tests for `GET /api/v1/admin/shops?page=1&limit=5`: returns paginated envelope `{ data, total, page, limit }` with at most 5 records; calling without params defaults to `limit=20`

## 11. Testing Infrastructure — Backend E2E Tests

- [x] 11.1 Write E2E flow test: customer self-registration → OTP verify → login → `POST /api/v1/orders` → assert `orders` row with status `placed` and correct `total_amount` in test DB
- [x] 11.2 Write E2E flow test: shop owner accepts order → delivery person assigned → `PUT /api/v1/delivery/:id/delivered` with `proof_image` → assert order status `delivered` and `total_cans_given` incremented in `customer_can_balance`
- [x] 11.3 Write E2E flow test: simulate 3 COD failures for a user → assert `users.cod_failed_count = 3` and `users.cod_blocked = true` after third failure
- [x] 11.4 Write E2E flow test: UPI order placed → cancelled after pickup with `cancellation_count_30d = 1` → assert refund record created with 60% of order total and full deposit refund separately

## 12. Testing Infrastructure — Frontend Unit Tests

- [x] 12.1 Write unit tests for `frontend/utils/` functions covering: price formatting, distance calculation, coupon validation, and PIN strength validation (no sequential/repeated digits)
- [x] 12.2 Write unit tests for the `orderStore` Zustand store: `setCart` adds items, `clearCart` resets state, `setActiveOrder` updates the active order, and the `pendingCans` derived value is correct
- [x] 12.3 Write unit tests for the `authStore`: login action sets `accessToken` and `user`, logout clears state, and silent refresh updates the token without losing user data

## 13. Testing Infrastructure — Frontend Component Integration Tests

- [x] 13.1 Write integration tests for `checkout.tsx`: renders price breakdown with deposit line for water order, renders without deposit line for non-water order, Place Order button is disabled when `pending_cans >= 3`, COD option is disabled when `cod_blocked = true`
- [x] 13.2 Write integration tests for `login.tsx` (PIN screen): shows attempt counter after failed login, shows lockout message after 3 failures, navigates to dashboard on success
- [x] 13.3 Write integration tests for `order-tracking.tsx`: renders status timeline, shows error state when API returns 500, shows retry button on network failure
- [x] 13.4 Write integration tests for the shop product list screen: renders `EmptyState` when no products exist, renders product cards when products are returned, tapping Add correctly updates the cart store

## 14. Testing Infrastructure — Frontend Detox E2E Tests

- [x] 14.1 Write Detox E2E for customer journey: launch app → enter phone → PIN → Customer Home visible → tap shop → add product → checkout → Place Order → Order Tracking screen with correct status
- [x] 14.2 Write Detox E2E for delivery person journey: login → Delivery Dashboard shows pending order → tap order → capture mock proof photo → Mark as Delivered → order shows `delivered` in tracking
- [x] 14.3 Write Detox E2E for shop owner journey: login → Shop Dashboard → tap pending order → Accept → delivery person assigned confirmation visible
