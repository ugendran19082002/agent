## Context

The existing `coupons` table already captures `issuer_type` (`admin`/`shop`), a single `user_id` for individual restriction, and `max_uses`/`max_uses_per_user` limits. `OrderService` already splits discount amounts into `admin_discount_amount` and `shop_discount_amount` based on `issuer_type`. `UserShopStat` tracks per-user order history per shop but has no status or blocking fields. What's missing is: multi-user assignment, shop-level customer status, coupon browsing, and assignment notifications.

## Goals / Non-Goals

**Goals:**
- Support global, bulk, and individual coupon scoping via a `CouponUser` junction table
- Extend `UserShopStat` with `status` (regular/blocked) and `tag` for shop-level customer management
- Block shop-blocked customers at order creation time
- Provide a coupon discovery API (shop coupons browseable; eligible global coupons surfaced)
- Notify customers via push when a coupon is assigned to them

**Non-Goals:**
- Automatic coupon stacking or combining multiple coupons in one order (existing 1-coupon-per-order rule stays)
- Coupon analytics dashboard (beyond existing `used_count`)
- Referral-based coupon generation (that path exists separately via `ReferralService`)

## Decisions

### Decision 1: CouponUser junction table instead of expanding the `user_id` column

A `coupon_users` table (`coupon_id`, `user_id`, unique constraint) replaces the single `user_id` column for multi-user scoping. The existing `user_id` column is retained for backwards compatibility with existing single-user coupons (migrated to `coupon_users` rows on deploy), then soft-deprecated.

**Why**: Changing the existing `user_id` column to a JSON array would break `validateCoupon` queries. A junction table is relational-correct, queryable by index, and mirrors how promotions at scale are modeled.

**Alternatives considered**: JSON column of user IDs — rejected because it cannot be indexed and makes per-user lookups O(n) scans.

### Decision 2: scope ENUM on Coupon — `global`, `bulk`, `individual`

Add `scope: ENUM("global", "bulk", "individual")` to the `coupons` table.
- `global` → no `CouponUser` rows; any user can apply
- `bulk` → one `CouponUser` row per selected user
- `individual` → exactly one `CouponUser` row

**Why**: Makes filtering and validation fast — a global coupon skips the junction table lookup entirely.

### Decision 3: Shop-block enforcement in OrderService, not middleware

The shop-block check (`UserShopStat.status === "blocked"`) runs inside `validateAndCalculateOrder` at order creation time, not in a middleware layer.

**Why**: Order validation is the authoritative gate. Middleware would apply to all routes including order status polls and tracking, which don't need blocking. Scoping it to order creation is the minimal correct change.

### Decision 4: Coupon discovery via two separate endpoints

- `GET /api/shops/:shopId/coupons` → active shop-owned coupons visible to any customer (public)
- `GET /api/users/me/coupons` → coupons assigned to the authenticated user (personal)

**Why**: These have different auth requirements and caching profiles. Merging them into one endpoint would require complex auth branching.

### Decision 5: Assignment notification is fire-and-forget

Calling `addJob("push-coupon-notification", ...)` after coupon creation rather than awaiting the push delivery.

**Why**: Push delivery can fail or be delayed. Blocking the coupon creation API response on push success would degrade UX for no functional gain. The queue already handles retries.

## Risks / Trade-offs

- **Backwards compatibility on coupon validation**: Existing coupons with `user_id` set must also be found via `CouponUser` lookup → Mitigation: migration script copies existing `user_id` rows into `coupon_users` on deploy, then `validateCoupon` queries `coupon_users` exclusively
- **Bulk coupon creation performance**: Creating 10,000 `CouponUser` rows for "all customers" could be slow in a single transaction → Mitigation: batch insert in chunks of 500; queue the bulk assignment as a background job
- **Shop-block UX**: Customer needs a clear error message when blocked, not a generic failure → Mitigation: specific error code `SHOP_BLOCKED` with a user-facing message
- **Discovery API cacheability**: Shop coupon lists change rarely but are fetched on every shop page view → Mitigation: short-lived (60s) cache on the shop coupon list endpoint

## Migration Plan

1. Add `scope` column to `coupons` (default `"individual"` for rows with `user_id` set, `"global"` for rows without)
2. Create `coupon_users` table
3. Run migration script: copy all existing `coupon.user_id` rows into `coupon_users`
4. Add `status`, `tag` columns to `user_shop_stats`
5. Deploy backend (new endpoints + updated `validateCoupon` + order-creation block check)
6. Deploy frontend changes
7. (Post-deploy) soft-deprecate direct `Coupon.user_id` writes — all new coupons go through `coupon_users`

## Open Questions

- Should shop-blocked customers see a "you are blocked from this shop" message, or a generic "shop unavailable"? (Recommend specific message for transparency)
- Maximum number of customers selectable in a single bulk assignment? (Suggest 5,000 per batch to avoid timeout)
