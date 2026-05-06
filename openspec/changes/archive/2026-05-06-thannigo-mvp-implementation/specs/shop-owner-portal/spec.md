## ADDED Requirements

### Requirement: Shop open/close toggle
Shop owners SHALL toggle their shop between Open and Closed states. A closed shop is still visible to customers but blocks new orders. In-progress orders continue normally.

#### Scenario: Shop owner closes the shop
- **WHEN** a shop owner sets the shop to Closed
- **THEN** new orders SHALL be blocked; the shop SHALL still appear to customers marked "Currently Closed"; in-progress orders SHALL continue processing

#### Scenario: Shop owner re-opens the shop
- **WHEN** a shop owner sets the shop to Open
- **THEN** customers SHALL be able to place new orders at the shop

### Requirement: Post-approval shop settings configuration
After Admin approval, the shop owner SHALL configure operational settings before going live. When shop type is "Both" (Residential and Commercial), all settings SHALL be configurable independently per zone.

#### Scenario: Shop owner configures delivery radius and pricing
- **WHEN** an approved shop owner sets `free_delivery_km`, `per_km_price`, and `max_delivery_km` for a zone
- **THEN** the system SHALL apply these values to all delivery charge calculations for orders in that zone

#### Scenario: Shop owner enables instant delivery
- **WHEN** a shop owner enables the `is_instant` toggle and sets `from_time`, `to_time`, and `grace_time`
- **THEN** the shop's instant delivery window SHALL be active during the configured hours

#### Scenario: Instant delivery fields hidden when toggle is OFF
- **WHEN** `is_instant` is toggled OFF
- **THEN** the `from_time`, `to_time`, and `grace_time` fields SHALL be hidden and not configurable

### Requirement: Category management with uniqueness constraint
Shop owners SHALL create, edit, and delete product categories and sub-categories. Category names must be unique within the shop.

#### Scenario: Duplicate category name rejected
- **WHEN** a shop owner creates a category with a name already used in the same shop
- **THEN** the system SHALL log PROD0001 and display "A category with this name already exists."

#### Scenario: Delete category with active products blocked
- **WHEN** a shop owner attempts to delete a category that still contains active products
- **THEN** the system SHALL log PROD0002 and display "Remove or reassign all products before deleting."

### Requirement: Product add/edit with water product configuration
Shop owners SHALL add and edit products. Water products require `can_size` selection. The deposit amount for water products SHALL be displayed as read-only (platform-wide rate from System Settings, not editable by shop owner).

#### Scenario: Water product added with can size selected
- **WHEN** a shop owner adds a product with `is_water = true` and selects a can size (20L or 10L)
- **THEN** the system SHALL display the current platform deposit rate for that can size as a read-only field on the product form

#### Scenario: Water product submitted without can size
- **WHEN** a shop owner submits a water product without selecting a can size
- **THEN** the system SHALL log PROD0008 and display "Please select a can size for water products."

#### Scenario: Non-water product — no deposit shown
- **WHEN** a shop owner adds a product with `is_water = false`
- **THEN** no deposit field SHALL appear on the product form

#### Scenario: Product image limit exceeded
- **WHEN** a shop owner uploads more than 5 images or an image larger than 3MB
- **THEN** the system SHALL log PROD0006 or PROD0007 and display the appropriate error

### Requirement: Product Rule Configuration Panel per product
Tapping a product SHALL open a Rule Configuration Panel with 5 sections: Quantity Rules, Delivery Rules, Floor Charges, Pricing Rules (with bulk discount), and a Live Calculation Preview. Rules set here override shop-level defaults for that product.

#### Scenario: Bulk discount enabled with threshold and percentage
- **WHEN** a shop owner enables the bulk discount toggle and sets a threshold quantity and discount percentage
- **THEN** the system SHALL apply the discount to all units when the order quantity meets or exceeds the threshold

#### Scenario: Bulk discount disabled
- **WHEN** the bulk discount toggle is OFF
- **THEN** the system SHALL apply standard pricing for all quantities for that product

#### Scenario: Lift charge always visible to customer
- **WHEN** a shop owner configures a lift charge
- **THEN** the lift charge SHALL always appear as a separate visible line item to customers; the `is_lift_hidden_charge` flag SHALL NOT be used to suppress it

#### Scenario: Live calculation preview updates on input change
- **WHEN** any input in the Rule Configuration Panel changes
- **THEN** the Live Calculation Preview SHALL recalculate instantly showing: Items Total, Floor Charge, Lift Charge, Delivery Charge, Bulk Discount (if applicable), and Final Total

#### Scenario: Fallback hierarchy applied
- **WHEN** a product has no rule set for a given field
- **THEN** the system SHALL apply the sub-category default, then shop-level default, then system-wide default, in that priority order

### Requirement: Order acceptance with timeout and auto-reject
Shop owners SHALL accept or reject orders within a configurable timeout (default 10 minutes). Failure to respond triggers an auto-reject.

#### Scenario: Shop accepts an order within timeout
- **WHEN** a shop owner accepts an order before the timeout
- **THEN** the order status SHALL change to Accepted; the system SHALL auto-assign the nearest available delivery person; the customer SHALL be notified

#### Scenario: Shop manually reassigns delivery person
- **WHEN** a shop owner selects a different delivery person after auto-assignment
- **THEN** the delivery assignment SHALL update to the chosen delivery person

#### Scenario: Shop does not respond within timeout
- **WHEN** the configured order acceptance timeout elapses without a shop response
- **THEN** the system SHALL log ORD0001, auto-reject the order, and present the customer with Switch Shop or Refund options

#### Scenario: Shop rejects an order
- **WHEN** a shop owner taps Reject for an order
- **THEN** the customer SHALL be presented with Switch Shop or Refund options on a reject resolution screen

### Requirement: Delivery person management by shop owner
Shop owners SHALL create, reset PINs for, deactivate, and remove delivery persons from the Shop Dashboard.

#### Scenario: Shop owner deactivates a delivery person
- **WHEN** a shop owner deactivates a delivery person
- **THEN** the delivery person SHALL not receive new auto-assignments while deactivated; historical records are retained

#### Scenario: Shop owner removes a delivery person
- **WHEN** a shop owner removes a delivery person from the shop
- **THEN** the delivery person is unlinked from the shop; all historical delivery records SHALL be retained

### Requirement: Customer block/unblock by shop owner
Shop owners SHALL block and unblock customers within their shop. A blocked customer cannot place orders at that shop; other shops are unaffected.

#### Scenario: Shop owner blocks a customer
- **WHEN** a shop owner confirms blocking a customer after the confirmation dialog
- **THEN** the customer SHALL be unable to place orders at that shop; the customer SHALL be notified via app

#### Scenario: Blocked customer attempts to order from the shop
- **WHEN** a blocked customer attempts to place an order at the shop that blocked them
- **THEN** the system SHALL log CUST0003 and prevent order placement

#### Scenario: Shop owner unblocks a customer
- **WHEN** a shop owner confirms unblocking a customer
- **THEN** the customer's status SHALL be restored to Regular and they may place orders at that shop

### Requirement: Shop analytics MVP (4 reports)
Shop owners SHALL view 4 analytics reports filtered by time period (Today / This Week / This Month).

#### Scenario: Shop owner views order summary
- **WHEN** a shop owner opens the Order Summary report
- **THEN** the system SHALL display total orders, accepted, rejected, and cancelled counts for the selected period

#### Scenario: Shop owner views top selling products
- **WHEN** a shop owner views the Top Selling Products report
- **THEN** the system SHALL display the top 5 products by order count for This Week or This Month

### Requirement: Shop coupon creation and customer assignment
Shop owners SHALL create coupons scoped to their shop only. The shop SHALL absorb the discount (no platform reimbursement). Coupons MAY target all customers, selected customers from the shop's customer list, or an individual customer.

#### Scenario: Shop owner creates a shop-wide coupon
- **WHEN** a shop owner submits a coupon with a unique alphanumeric code (4–20 chars), discount type and value, future expiry, and customer target = "All Customers"
- **THEN** the system SHALL persist the coupon with `issuer_type = shop` and the shop's `shop_id`; the coupon SHALL be visible only to customers placing orders at this shop

#### Scenario: Shop owner assigns a coupon to selected customers
- **WHEN** a shop owner selects one or more Regular customers from the Customer List and assigns a shop coupon
- **THEN** the system SHALL create coupon-user links for each selected customer; only those customers SHALL see the coupon as available

#### Scenario: Shop coupon settlement at checkout
- **WHEN** a customer applies a valid shop coupon at checkout
- **THEN** the customer SHALL pay the discounted amount and the shop SHALL receive the same discounted amount; the platform SHALL NOT reimburse the shop

#### Scenario: Duplicate shop coupon code rejected
- **WHEN** a shop owner submits a coupon code that already exists anywhere in the system
- **THEN** the system SHALL log CPN0005 and reject the creation
