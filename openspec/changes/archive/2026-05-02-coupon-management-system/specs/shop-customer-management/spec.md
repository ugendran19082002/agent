## ADDED Requirements

### Requirement: Shop-level customer status
The `user_shop_stats` table SHALL have a `status` field with values `regular` and `blocked` (default `regular`), and an optional `tag` text field. Shop owners SHALL be able to update a customer's status for their shop.

#### Scenario: Shop views customer list
- **WHEN** a shop owner accesses `GET /api/shop-owner/customers`
- **THEN** the response SHALL return a list of customers who have placed at least one order at that shop, with `status`, `tag`, `total_orders`, and `last_order_at`

#### Scenario: Shop marks customer as blocked
- **WHEN** a shop owner submits `PATCH /api/shop-owner/customers/:userId/status` with `{ status: "blocked" }`
- **THEN** the system SHALL update `user_shop_stats.status` to `"blocked"` for that user/shop pair
- **AND** the customer SHALL be unable to place new orders at that shop

#### Scenario: Shop marks customer as regular
- **WHEN** a shop owner submits `PATCH /api/shop-owner/customers/:userId/status` with `{ status: "regular" }`
- **THEN** the system SHALL update `user_shop_stats.status` to `"regular"` for that user/shop pair
- **AND** the customer SHALL regain the ability to place orders at that shop

#### Scenario: Shop adds a tag to a customer
- **WHEN** a shop owner submits a `tag` string along with a status update
- **THEN** the system SHALL store the tag on `user_shop_stats.tag` for that user/shop pair

### Requirement: Blocked customer cannot place orders at blocked shop
At order creation time, the system SHALL check whether the customer is blocked at the target shop and reject the order if so.

#### Scenario: Order blocked for blocked customer
- **WHEN** a customer with `user_shop_stats.status = "blocked"` for the target shop attempts to place an order
- **THEN** the system SHALL reject the order with error code `SHOP_BLOCKED` and a user-facing message "You are currently unable to place orders at this shop"

#### Scenario: Order allowed for regular customer
- **WHEN** a customer with `user_shop_stats.status = "regular"` (or no stat record) attempts to place an order
- **THEN** the system SHALL proceed with order validation normally

### Requirement: Shop can assign coupons to tagged regular customers
Shop owners SHALL be able to filter their customer list by tag and generate bulk coupons for filtered customers.

#### Scenario: Tag-based coupon generation
- **WHEN** a shop owner selects customers by tag and initiates coupon generation
- **THEN** the system SHALL create a bulk coupon and assign it to all customers matching the tag in that shop
