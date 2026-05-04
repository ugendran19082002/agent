## Why

The Thannigo MVP is functionally complete but carries structural debt that will cause progressive degradation under real user load: a 2,286-line `OrderService` monolith, no systematic Redis caching (every hot read hits MySQL), inconsistent pagination across list endpoints, and no structured logging to diagnose production issues. Addressing these now — before the first production release — avoids costly rewrites after data volumes grow and users are live.

## What Changes

- **Decompose `OrderService.js`** (2,286 lines) into focused sub-services: `OrderPlacementService`, `OrderCancellationService`, `OrderQueryService`, `OrderLifecycleService`. No behavior changes; pure restructuring.
- **Introduce a systematic Redis caching layer** for system settings, shop discovery results, and user COD/loyalty profiles. Cache is invalidated on write; reads fall through to MySQL on miss.
- **Standardize pagination** across all admin and shop-owner list endpoints (orders, customers, analytics, complaints) using a consistent cursor/offset envelope.
- **Add structured logging and request correlation** so every inbound request carries a `X-Request-ID` that flows through service calls, queue jobs, and error logs.
- **Optimize frontend rendering** by auditing and applying `React.memo`, `useMemo`, `useCallback`, and `FlatList` `keyExtractor`/`getItemLayout` across high-frequency screens.
- **Add health-check and readiness endpoints** (`GET /health`, `GET /ready`) for Nginx and process managers.

## Capabilities

### New Capabilities

- `redis-caching-layer`: Defines the caching strategy, invalidation rules, TTLs, and hit/miss logging for system settings, shop listings, and user trust profiles.
- `order-service-decomposition`: Defines the sub-service split of `OrderService`, the boundaries between placement, cancellation, lifecycle, and query responsibilities, and the zero-regression contract.
- `observability-and-logging`: Defines structured log format (JSON), request correlation ID middleware, log levels per environment, health/readiness endpoint contracts, and error-tracking integration points.
- `pagination-standardization`: Defines the unified pagination envelope (offset + limit + total or cursor-based), required query params, and the migration path for existing list endpoints.
- `frontend-render-optimization`: Defines which screens require memoization, FlatList tuning rules, lazy-loaded route chunks, and image caching patterns.

### Modified Capabilities

- `checkout-refactor`: `OrderService.placeOrder` is being extracted to `OrderPlacementService`; the checkout flow's service-call boundary changes.

## Impact

- **Backend**: `backend/src/services/order/OrderService.js` split into 4 focused files; `backend/src/config/redis.js` gains a cache helper module; new middleware file for correlation IDs; all list controllers updated for pagination envelope.
- **Frontend**: High-traffic screens (`Customer Home`, `Order Tracking`, `Order History`, `Delivery Dashboard`) audited and patched for render performance; bundle entry split reviewed.
- **Infrastructure**: Two new Express routes (`/health`, `/ready`) used by Nginx upstream checks and PM2 health probes.
- **No breaking API changes**: All existing endpoint paths, auth, and response shapes are preserved.
