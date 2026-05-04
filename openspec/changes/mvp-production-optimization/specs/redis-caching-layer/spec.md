## ADDED Requirements

### Requirement: CacheService Wrapper
The system SHALL provide a `CacheService` module at `backend/src/services/cache/CacheService.js` that wraps the existing `ioredis` instance and exposes `getOrSet(key, ttlSeconds, fetchFn)`, `invalidate(key)`, and `invalidatePattern(pattern)` helpers. All Redis calls SHALL be wrapped in try/catch; on Redis failure the service SHALL log `CACHE0001` and invoke `fetchFn` directly as a fallback.

#### Scenario: Cache hit
- **WHEN** `getOrSet` is called for a key that exists in Redis with a non-expired TTL
- **THEN** the cached value is returned without calling `fetchFn`

#### Scenario: Cache miss
- **WHEN** `getOrSet` is called for a key that does not exist or has expired
- **THEN** `fetchFn` is invoked, its result is serialized and stored in Redis with the given TTL, and the result is returned to the caller

#### Scenario: Redis is unavailable
- **WHEN** the Redis connection is down or throws during a `getOrSet` call
- **THEN** the system logs `CACHE0001` at warn level, calls `fetchFn` directly, and returns the result without writing to Redis

#### Scenario: Cache invalidation
- **WHEN** `invalidate(key)` is called
- **THEN** the key is deleted from Redis and subsequent `getOrSet` calls for that key invoke `fetchFn`

### Requirement: System Settings Redis Cache
The `SystemSettingsService` SHALL delegate its per-key caching to `CacheService` with a TTL of 300 seconds (5 minutes) instead of the current in-process `Map` with 30-second TTL. The in-process `Map` cache SHALL be removed.

#### Scenario: Setting read after admin update
- **WHEN** an admin updates a system setting via `PUT /api/v1/admin/settings/:key`
- **THEN** `CacheService.invalidate('sys_setting:{key}')` is called and the next read fetches the fresh value from MySQL

#### Scenario: Multiple Node processes
- **WHEN** two Node processes both read the same system setting within the 5-minute TTL window
- **THEN** both processes receive the same cached value from Redis without each hitting MySQL

### Requirement: Shop Discovery Cache
The `ShopService.getNearbyShops` function SHALL cache its MySQL result in Redis under the key `shop_discovery:{lat6}:{lng6}:{radius}` (coordinates rounded to 6 decimal places) with a TTL of 60 seconds. The cache SHALL be invalidated when a shop's open/closed status changes or when a shop is approved or deactivated.

#### Scenario: Repeated nearby-shop request within TTL
- **WHEN** two requests with identical coordinates and radius arrive within 60 seconds
- **THEN** the second request is served from Redis and does not execute the geospatial MySQL query

#### Scenario: Shop status change invalidates cache
- **WHEN** a shop owner toggles their shop open or closed via `PATCH /api/v1/shop-owner/shop/status`
- **THEN** all `shop_discovery:*` keys for that shop's geographic area are purged via `invalidatePattern`

### Requirement: User Trust Profile Cache
The COD status and loyalty tier of a user SHALL be cached in Redis under `user_trust:{userId}` with a TTL of 120 seconds to reduce repeated `users` table reads during order placement validation.

#### Scenario: Order placement reads cached trust profile
- **WHEN** a customer places an order and their trust profile was cached within the last 2 minutes
- **THEN** the `users.cod_blocked`, `users.cod_failed_count`, and `users.cod_trust_score` values are read from Redis without a separate `SELECT` on the `users` table

#### Scenario: COD update invalidates trust cache
- **WHEN** a COD failure or block event writes updated values to `users`
- **THEN** `CacheService.invalidate('user_trust:{userId}')` is called immediately and the next order placement fetches fresh values

### Requirement: Cache Key Isolation
All cache keys managed by `CacheService` SHALL be prefixed with `cache:` to prevent collisions with BullMQ key space. The `ioredis` instance used for caching SHALL be the same connection exported from `backend/src/queue/index.js`.

#### Scenario: BullMQ key space is unaffected
- **WHEN** `CacheService.invalidatePattern('shop_discovery:*')` is called
- **THEN** only keys matching `cache:shop_discovery:*` are deleted and no BullMQ job, lock, or completed-set keys are affected
