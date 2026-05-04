## Context

The Thannigo MVP backend is a Node/Express + Sequelize stack backed by MySQL, with BullMQ workers using an existing `ioredis` connection for job queues. The frontend is React Native (Expo Router). Four areas need structural work before production traffic arrives:

1. **`OrderService.js` is a 2,286-line God object** with only 3 exported functions and ~20 private helpers — a maintenance and test hazard.
2. **SystemSettingsService has an in-process 30-second `Map` cache** that won't survive process restarts or multi-instance deployments. Shop discovery and user trust profiles hit MySQL on every request.
3. **No request correlation IDs** — production logs have no way to trace a customer's full request/job chain.
4. **Inconsistent list endpoints** — some return `{data, total}`, others return raw arrays; pagination params differ across routes.
5. **Frontend FlatLists and heavy screens** lack `getItemLayout`, `React.memo` on list-item components, or fixed item height hints.

---

## Goals / Non-Goals

**Goals:**
- Break `OrderService.js` into 4 focused files with zero behavior changes
- Move hot-path cache reads (system settings, shop discovery, user trust) to Redis
- Add correlation ID middleware that threads `X-Request-ID` through logs and jobs
- Define and enforce one pagination envelope across all list endpoints
- Apply `React.memo` + `getItemLayout` to the 5 highest-frequency FlatList screens
- Add `/health` and `/ready` endpoints

**Non-Goals:**
- Changing any endpoint contract, auth rule, or business logic
- Migrating from REST to GraphQL
- Adding new product features
- Frontend bundle splitting / code-splitting (Expo Router handles this automatically)

---

## Decisions

### D1 — OrderService decomposition: facade pattern, not import surgery

**Decision:** Create 4 new service files. Keep `OrderService.js` as a thin re-export facade so existing controller imports need no changes.

```
backend/src/services/order/
  OrderService.js           ← facade: re-exports everything
  OrderPlacementService.js  ← placeOrder, deposit logic, checkout guards
  OrderCancellationService.js ← cancel, refund initiation, restore side effects
  OrderSwitchService.js     ← findBestShop, computeSwitchOrderTotal, switchShop
  OrderQueryService.js      ← getOrderById, getOrderHistory, list queries
  OrderDaemonService.js     ← unchanged (timeout jobs)
  InvoiceService.js         ← unchanged
  SlotService.js            ← unchanged
```

**Why facade over direct import surgery:** Controllers import from `OrderService`. Changing those imports across 3+ controller files is churn that adds no value and risks regressions. The facade approach makes the decomposition invisible to callers.

**Alternative considered:** Inline class with grouped methods — rejected because the codebase uses named function exports throughout; introducing a class would be an inconsistent pattern.

---

### D2 — Redis caching: thin `CacheService` wrapper over existing ioredis

**Decision:** Add `backend/src/services/cache/CacheService.js` that wraps the existing `ioredis` instance from `backend/src/queue/index.js`. Three cache namespaces:

| Namespace | Key pattern | TTL | Invalidated on |
|---|---|---|---|
| `sys_setting:{key}` | per setting key | 5 min | `PUT /admin/settings/:key` |
| `shop_discovery:{lat6}:{lng6}:{radius}` | rounded to 6 decimal places | 60 s | shop status toggle, shop approval |
| `user_trust:{userId}` | per user | 2 min | COD update, block/unblock |

`SystemSettingsService` drops its in-process `Map` and calls `CacheService.getOrSet()`. Shop discovery in `ShopService.getNearbyShops()` wraps its query in the same helper.

**Why not a separate Redis client:** `ioredis` is already initialized for BullMQ. Sharing the same connection pool avoids a second TCP connection and keeps config in one place. Cache keys use a `cache:` prefix to avoid colliding with BullMQ key space.

**Why not `node-cache` / in-process Map:** Doesn't survive process restarts; won't work if the app is scaled to multiple instances.

---

### D3 — Correlation IDs: `X-Request-ID` middleware injected at the top of the Express chain

**Decision:** Add `backend/src/middleware/correlationId.js`. On every inbound request: read `X-Request-ID` header (trust client-supplied UUIDs) or generate `crypto.randomUUID()`. Store on `req.correlationId`. Override `logger.child({ correlationId })` for request-scoped logging. Echo the ID in the response header.

BullMQ jobs receive `{ correlationId }` in their job data so worker logs carry the same ID.

**Alternative considered:** AsyncLocalStorage for implicit threading — more ergonomic but requires Node ≥ 16.4 and complicates unit testing. Explicit `req.correlationId` pass-through is simpler and works everywhere.

---

### D4 — Pagination: offset-based, single envelope, enforced via shared middleware

**Decision:** All list endpoints return:
```json
{ "data": [...], "total": <int>, "page": <int>, "limit": <int> }
```
Query params: `?page=1&limit=20` (default). Max `limit` capped at 100 via a shared `paginationMiddleware`. Endpoints that currently return raw arrays are updated in their controller layer only — services remain unchanged.

**Why offset over cursor:** Admin and shop-owner screens need page-number UX ("Page 3 of 12") which cursor pagination can't provide without a count query. Cursor pagination is better for infinite-scroll feeds; none of the affected screens use infinite scroll.

---

### D5 — Frontend render optimization: targeted fixes, not a global memo pass

**Decision:** Apply optimizations only to screens where re-render cost is observable:
- `Customer Home` product/shop list: `React.memo` on `ShopCard`, `getItemLayout` (fixed 120px card height)
- `Order History` list: `React.memo` on `OrderHistoryItem`, `getItemLayout` (fixed 88px row height)
- `Delivery Dashboard` pending list: `getItemLayout` (fixed 72px row height)
- `Admin Shop List`: `React.memo` on table row component
- Replace `Image` from `react-native` with `Image` from `expo-image` for automatic disk+memory caching on all list thumbnail images

**Why not a global memo pass:** `React.memo` has a comparison cost; applying it to every component increases bundle size and comparison overhead without measurable benefit on low-list-count screens (e.g., 4-step onboarding).

---

### D6 — Health endpoints: Express router, no auth, mounted before JWT middleware

**Decision:** `GET /health` returns `{ status, db, redis, queue }` with HTTP 200/503. `GET /ready` returns HTTP 200 only after DB and Redis have connected successfully. Both are mounted before the JWT middleware so Nginx upstream checks and PM2 health probes don't require tokens.

---

## Risks / Trade-offs

- **[Facade adds one indirection level]** → The re-export facade means IDEs may show `OrderService` as the source of functions that live in sub-files. Mitigated by JSDoc `@see` references in the facade. This is a one-time IDE inconvenience, not a runtime risk.

- **[Redis miss on cold start]** → First request after deploy or Redis restart hits MySQL. System settings cache fills within 5 minutes. Shop discovery cache fills within the first few customer requests. No data loss or correctness risk.

- **[Redis becomes a new failure point]** → `CacheService.getOrSet()` wraps every Redis call in try/catch; on error it logs `CACHE0001` and falls through to the database query. The system degrades gracefully, not hard-fails.

- **[`getItemLayout` requires fixed row heights]** → If a future design change makes `ShopCard` heights variable (e.g., optional badge row), `getItemLayout` will produce incorrect scroll offsets. Mitigated by documenting the fixed-height assumption in the component.

- **[Pagination total count query]** → Adding `COUNT(*)` to every list query adds a small overhead (~5ms). For admin pages with < 10k rows this is acceptable. If a table grows past 1M rows, the count query will need to be replaced with an approximate count or eliminated in favour of cursor pagination.

---

## Migration Plan

1. Create `CacheService` and update `SystemSettingsService` first (lowest risk — settings reads are always correct on miss).
2. Decompose `OrderService` — do it file by file, running existing tests after each extraction. Keep the facade updated as functions move.
3. Add correlation ID middleware and update logger calls in the 5 highest-traffic controllers.
4. Update pagination on list endpoints controller-by-controller.
5. Apply frontend render optimizations screen-by-screen; run on a device to spot regressions before each commit.
6. Add health/ready endpoints last (infrastructure-facing, no user impact).

**Rollback:** Every change is backward-compatible. If a Redis-backed cache causes issues, `CacheService.getOrSet()` can be disabled via a `DISABLE_CACHE=true` env flag that short-circuits to the database fallback.

---

## Open Questions

- Should `shop_discovery` cache be invalidated on inventory changes (shop stocks out of a product)? Currently proposed invalidation is only on shop status toggle. Inventory-based invalidation would require hooking into `InventoryService`, adding complexity. Recommend leaving it with TTL-only expiry since 60s staleness on discovery is acceptable.
- Should `/health` be public or IP-restricted? Current proposal: public (no auth). If the infra team wants to restrict it to Nginx and PM2 only, add an IP allowlist in Nginx instead of in Express.
