## Why

The current coupon system supports basic single-user or shop-wide codes but lacks bulk assignment, customer segmentation, shop-level customer management, and coupon discovery — preventing shops and admins from running targeted promotions. These gaps need to be closed to support the platform's growth and retention strategy.

## What Changes

- Add `scope` field to coupons (`global`, `bulk`, `individual`) and a `CouponUser` junction table for multi-user assignment — replacing the single `user_id` column approach
- Add shop-level customer management: extend `UserShopStat` with `status` (regular / blocked) and `tag` — block enforcement prevents blocked customers from placing orders at that shop
- Add coupon discovery API: customers can browse active shop coupons on the shop page and available global coupons at checkout
- Add coupon assignment notifications: customers receive a push notification when a coupon is assigned to them
- Admin and shop-owner UIs gain a coupon creation flow with audience selection (all / bulk / individual)
- Checkout flow gains an available-coupon browser alongside the existing manual code entry

## Capabilities

### New Capabilities

- `coupon-bulk-assignment`: Coupon scoping (global / bulk / individual) with a `CouponUser` junction table allowing many-to-many assignment; admin and shop flows for audience selection and bulk code generation
- `shop-customer-management`: Shop-level customer status tagging (regular / blocked) stored on `UserShopStat`; blocked customers cannot place orders at that shop; shop owner UI to view and manage customer status
- `coupon-discovery`: Customers can browse active coupons for a shop on the shop page and see eligible global/admin coupons at checkout; auto-apply eligible single-use coupons
- `coupon-notifications`: Push notification sent to each assigned customer when a coupon is created and assigned to them

### Modified Capabilities

- `checkout-refactor`: Checkout must check if customer is shop-blocked before allowing order placement; coupon browser replaces empty-state manual-only entry with a list of available coupons

## Impact

- **Database**: New `coupon_users` junction table; `coupons` gains `scope` column; `user_shop_stats` gains `status` and `tag` columns
- **Backend API**: New endpoints for coupon creation with audience, customer listing for shop owners, customer status update, and coupon discovery
- **Frontend (Customer)**: Shop page gains an Offers section; Checkout gains available coupon list; push notification on assignment
- **Frontend (Shop Owner)**: Customer management tab in shop dashboard; coupon creation with audience picker
- **Frontend (Admin)**: Coupon creation form with scope and customer selection
- **Existing CouponService**: `validateCoupon` must check `CouponUser` table in addition to `user_id` field; order placement must enforce shop-block check
