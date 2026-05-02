## 1. Database Migrations

- [x] 1.1 Add `scope` column (`ENUM("global","bulk","individual")`) to `coupons` table with default `"global"`
- [x] 1.2 Add `auto_apply` column (BOOLEAN, default false) to `coupons` table
- [x] 1.3 Create `coupon_users` table with `coupon_id`, `user_id`, unique constraint on (coupon_id, user_id)
- [x] 1.4 Add `status` (`ENUM("regular","blocked")`, default `"regular"`) and `tag` (VARCHAR, nullable) to `user_shop_stats` table
- [x] 1.5 Run migration script: copy all existing `coupons.user_id` rows into `coupon_users` and set `scope = "individual"` for those rows

## 2. Backend — Coupon Model & CouponUser Junction

- [x] 2.1 Add `CouponUser` model (`coupon_id`, `user_id`, `created_at`) and register in `model/index.js` with associations
- [x] 2.2 Add `scope` and `auto_apply` fields to `Coupon` model
- [x] 2.3 Update `CouponService.validateCoupon` to check `coupon_users` table for `bulk`/`individual` scoped coupons instead of `user_id` column
- [x] 2.4 Update `CouponService.validateCoupon` to enforce `max_uses_per_user` via `CouponUsage` count per user

## 3. Backend — Coupon Creation API (Admin + Shop)

- [x] 3.1 Create `POST /api/admin/coupons` endpoint accepting `{ scope, issuer_type:"admin", customer_ids?, discount_type, discount_value, expiry, ... }`
- [x] 3.2 Create `POST /api/shop-owner/coupons` endpoint for shop-side coupon creation with audience selection
- [x] 3.3 Implement bulk `CouponUser` insertion in batches of 500 when `scope = "bulk"` and `customer_ids` array is provided
- [x] 3.4 After bulk assignment, enqueue push notification jobs for each assigned customer
- [x] 3.5 Add `GET /api/admin/coupons` list endpoint with filters (scope, issuer_type, active)
- [x] 3.6 Add `GET /api/shop-owner/coupons` list endpoint for shop's own coupons

## 4. Backend — Shop Customer Management

- [x] 4.1 Add `GET /api/shop-owner/customers` endpoint returning customers who have ordered from the shop with `status`, `tag`, `total_orders`, `last_order_at`
- [x] 4.2 Add `PATCH /api/shop-owner/customers/:userId/status` endpoint accepting `{ status, tag? }` and updating `user_shop_stats`
- [x] 4.3 Add shop-block check inside `validateAndCalculateOrder` — if customer's `user_shop_stats.status === "blocked"` for the target shop, throw error code `SHOP_BLOCKED`
- [x] 4.4 Add `UserShopStat` upsert in `validateAndCalculateOrder` to ensure a stat row exists for new customer/shop pairs before the block check

## 5. Backend — Coupon Discovery API

- [x] 5.1 Add `GET /api/shops/:shopId/coupons` (public) — returns active global shop coupons + individual/bulk coupons where authenticated customer is listed
- [x] 5.2 Add `GET /api/users/me/coupons` (authenticated) — returns all active coupons assigned to customer plus eligible global admin coupons, sorted by `valid_until` asc
- [x] 5.3 Add auto-apply coupon lookup in `validateAndCalculateOrder` — if `auto_apply = true` coupon exists for the customer and no coupon_code was provided, apply it automatically

## 6. Backend — Coupon Notifications

- [x] 6.1 Create push notification job handler `push-coupon-notification` in the existing queue that sends a push to a user's registered push tokens
- [x] 6.2 Job payload: `{ user_id, coupon_code, discount_description, valid_until, deep_link: "/customer/coupons" }`
- [x] 6.3 Handle missing push tokens gracefully — log and skip without failing the job

## 7. Frontend — Admin Coupon Creation UI

- [ ] 7.1 Add coupon creation screen in admin panel (`/admin/coupons/create.tsx`) with fields: discount type, discount value, min order, expiry, scope selector
- [ ] 7.2 Scope selector: "All Customers" (global), "Selected Customers" (bulk, multi-select list), "One Customer" (individual, search by phone/name)
- [ ] 7.3 Wire form submission to `POST /api/admin/coupons`
- [ ] 7.4 Add coupons list screen (`/admin/coupons/index.tsx`) with active/expired tabs

## 8. Frontend — Shop Owner Coupon + Customer Management UI

- [ ] 8.1 Add coupon creation screen in shop owner panel (`/shop-owner/coupons/create.tsx`) with audience picker (all customers / by tag / individual)
- [ ] 8.2 Add `GET /api/shop-owner/customers` powered customer list screen (`/shop-owner/customers.tsx`) showing status, tag, total orders
- [ ] 8.3 Add swipe-actions or long-press menu on customer row to mark as Regular / Blocked and edit tag
- [ ] 8.4 Wire customer status update to `PATCH /api/shop-owner/customers/:userId/status`

## 9. Frontend — Customer Coupon Discovery

- [ ] 9.1 Add Offers section to shop detail page fetching `GET /api/shops/:shopId/coupons` and rendering coupon cards with discount and expiry
- [ ] 9.2 Create `AvailableCoupons` component that fetches `GET /api/users/me/coupons` filtered by current shop and renders a tappable list
- [ ] 9.3 Wire `AvailableCoupons` into checkout — tapping a coupon auto-fills `CouponInput` and triggers validation
- [ ] 9.4 Implement auto-apply logic in checkout: on load, if one eligible `auto_apply` coupon exists and no code is entered, apply it
- [ ] 9.5 Add customer coupons list screen (`/customer/coupons.tsx`) showing all assigned coupons with status (active/expired)

## 10. Frontend — Checkout Blocking & UX

- [ ] 10.1 Fetch shop-block status during checkout load (can be derived from the `SHOP_BLOCKED` error on calculate or via a dedicated check)
- [ ] 10.2 Show blocking message and disable Place Order button when customer is blocked from the shop
- [ ] 10.3 Update `CouponInput` to accept external `couponCode` prop so `AvailableCoupons` can set it
