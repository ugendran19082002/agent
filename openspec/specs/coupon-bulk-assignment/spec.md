## ADDED Requirements

### Requirement: Coupon scope field
Every coupon SHALL have a `scope` field with values `global`, `bulk`, or `individual`. Global coupons apply to all customers. Bulk and individual coupons are restricted to entries in the `coupon_users` junction table.

#### Scenario: Global coupon — any customer can apply
- **WHEN** a coupon with `scope = "global"` exists and is active
- **THEN** any authenticated customer SHALL be able to apply it at checkout without being listed in `coupon_users`

#### Scenario: Individual coupon — only assigned customer can apply
- **WHEN** a coupon with `scope = "individual"` is applied by a customer
- **THEN** the system SHALL validate that a `coupon_users` row exists for that customer and coupon
- **AND** reject the coupon with an appropriate error if no such row exists

#### Scenario: Bulk coupon — only listed customers can apply
- **WHEN** a coupon with `scope = "bulk"` is applied
- **THEN** the system SHALL validate the customer against the `coupon_users` table
- **AND** allow or reject based on presence of their row

### Requirement: Admin coupon creation with audience selection
Admin users SHALL be able to create coupons with audience: all customers, a list of selected customer IDs, or a single customer. Admin coupons SHALL NOT deduct from shop payout.

#### Scenario: Admin creates global coupon
- **WHEN** an admin submits a coupon creation request with `scope = "global"` and `issuer_type = "admin"`
- **THEN** the system SHALL create the coupon with no `coupon_users` rows
- **AND** the coupon SHALL be usable by any customer

#### Scenario: Admin creates bulk coupon for selected customers
- **WHEN** an admin submits a list of `customer_ids` along with coupon details
- **THEN** the system SHALL create the coupon with `scope = "bulk"`
- **AND** create one `coupon_users` row per customer ID (batched in chunks of 500)
- **AND** trigger push notifications for each assigned customer

#### Scenario: Admin creates individual coupon
- **WHEN** an admin submits a single `customer_id` with coupon details
- **THEN** the system SHALL create the coupon with `scope = "individual"` and one `coupon_users` row

### Requirement: Shop coupon creation with audience selection
Shop owners SHALL be able to create coupons for their own customers. Shop coupons SHALL be deducted from shop payout.

#### Scenario: Shop creates coupon for all its customers
- **WHEN** a shop owner creates a coupon with `scope = "global"` and `issuer_type = "shop"` (shop_id set)
- **THEN** any customer who has previously ordered from that shop SHALL be able to apply it at checkout

#### Scenario: Shop creates coupon for selected customers
- **WHEN** a shop owner selects specific customers from their customer list and generates a coupon
- **THEN** the system SHALL create `coupon_users` rows for each selected customer
- **AND** only those customers can apply the coupon

### Requirement: Coupon usage limit per customer
Every coupon SHALL respect `max_uses_per_user`. Attempting to apply a coupon that the customer has already used the maximum number of times SHALL be rejected.

#### Scenario: Per-user limit enforced
- **WHEN** a customer attempts to apply a coupon they have already used `max_uses_per_user` times
- **THEN** the system SHALL reject the coupon with an error indicating the usage limit is reached

### Requirement: CouponUser junction table
The system SHALL maintain a `coupon_users` table with (`coupon_id`, `user_id`) rows for all non-global coupons. This table is the authoritative source for coupon eligibility of individual and bulk scoped coupons.

#### Scenario: Existing single-user coupons migrated
- **WHEN** the migration runs
- **THEN** all existing coupons with a non-null `user_id` SHALL have a corresponding `coupon_users` row created
