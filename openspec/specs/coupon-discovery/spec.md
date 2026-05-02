## ADDED Requirements

### Requirement: Shop coupon browsing for customers
Customers SHALL be able to browse active, publicly visible coupons for a specific shop without applying them.

#### Scenario: Customer views shop offers
- **WHEN** a customer calls `GET /api/shops/:shopId/coupons`
- **THEN** the response SHALL return all active `issuer_type = "shop"` coupons for that shop where `scope = "global"` or the customer appears in `coupon_users`
- **AND** each coupon SHALL include code, discount type, discount value, minimum order value, and expiry date

#### Scenario: No active coupons
- **WHEN** a shop has no active coupons
- **THEN** `GET /api/shops/:shopId/coupons` SHALL return an empty array

### Requirement: Customer's assigned coupons list
Authenticated customers SHALL be able to view all coupons assigned to them, including global coupons they are eligible for.

#### Scenario: Customer views their coupons
- **WHEN** an authenticated customer calls `GET /api/users/me/coupons`
- **THEN** the response SHALL return all active coupons where the customer appears in `coupon_users` OR `scope = "global"`, sorted by expiry date ascending

#### Scenario: Expired coupons excluded
- **WHEN** a coupon's `valid_until` has passed
- **THEN** it SHALL NOT appear in `GET /api/users/me/coupons`

### Requirement: Checkout displays available coupons
At checkout, the system SHALL surface a list of eligible coupons for the customer and the selected shop, presented alongside the existing manual code entry.

#### Scenario: Available coupons shown at checkout
- **WHEN** a customer opens the checkout screen for a specific shop
- **THEN** the checkout SHALL fetch and display eligible coupons from `GET /api/users/me/coupons` filtered to coupons applicable to that shop (global or shop-specific)
- **AND** the customer SHALL be able to tap a coupon to auto-fill the coupon code field

#### Scenario: Auto-apply single eligible coupon
- **WHEN** exactly one eligible coupon is available for the customer/shop combination and it is marked `auto_apply = true`
- **THEN** the checkout SHALL automatically apply it without user action and display the discount in the bill

### Requirement: auto_apply flag on coupons
Coupons SHALL support an optional `auto_apply` boolean field. When true and the customer is eligible, the coupon is applied automatically at checkout.

#### Scenario: Auto-apply coupon is pre-selected at checkout load
- **WHEN** an eligible coupon with `auto_apply = true` exists for the customer
- **THEN** the checkout SHALL call `validateCoupon` with that code on page load and reflect the discount immediately

#### Scenario: Auto-apply skipped if customer manually entered another code
- **WHEN** the customer has already manually entered a different coupon code
- **THEN** the auto-apply coupon SHALL NOT override the manually entered one
