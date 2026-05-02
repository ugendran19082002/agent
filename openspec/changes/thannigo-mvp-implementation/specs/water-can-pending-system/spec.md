## ADDED Requirements

### Requirement: Per-can-size balance tracking with pending_cans
The system SHALL maintain a `customer_can_balance` record for each `(customer_id, can_size)` pair. Can sizes are 20L and 10L and are tracked completely independently. Fields: `total_cans_given` (integer, default 0), `total_cans_returned` (integer, default 0), `pending_cans` (computed: total_cans_given − total_cans_returned, never negative), `customer_deposit_balance` (decimal, default 0, never expires).

#### Scenario: New customer first water order
- **WHEN** a new customer places their first water product order
- **THEN** the system SHALL create a `customer_can_balance` row for the relevant can size (if it does not exist) with all values at zero before applying order deposit logic

#### Scenario: Balance never goes below zero
- **WHEN** any operation would cause `pending_cans` or `customer_deposit_balance` to become negative
- **THEN** the system SHALL log CAN0002, prevent the operation from going below zero, and treat the value as zero

#### Scenario: 20L and 10L balances are independent
- **WHEN** a customer returns a 20L can
- **THEN** only the 20L `customer_can_balance` row SHALL be updated; the 10L record SHALL be unaffected

### Requirement: Deposit charged at checkout based on pending_cans
The system SHALL automatically determine whether a deposit is required at checkout for water products based on the customer's `pending_cans` for that can size.

#### Scenario: New customer — deposit charged on first water order
- **WHEN** a customer with `pending_cans = 0` for the ordered can size places a water product order
- **THEN** the system SHALL add the platform deposit rate for that can size (from System Settings) to the order total; `pending_cans` logic tracks a new can going out

#### Scenario: Customer has pending can — no new deposit charged
- **WHEN** a customer with `pending_cans > 0` for the relevant can size places a water product order
- **THEN** the system SHALL NOT charge an additional deposit; the system tracks a new can going out after delivery

#### Scenario: Deposit amount stored immutably on order
- **WHEN** a deposit is charged at order time
- **THEN** the deposit amount SHALL be stored on the order record (`deposit_amount`) and SHALL NOT change after order creation even if System Settings rates are later updated

### Requirement: Platform-wide deposit rates managed by Admin
Deposit amounts for 20L and 10L cans SHALL be stored in `system_settings` (keys: `deposit_20l`, `deposit_10l`) and set exclusively by Admin. Shop owners cannot override these rates. The product form SHALL display the current rate as a read-only field.

#### Scenario: Admin updates deposit rate
- **WHEN** an Admin updates the 20L deposit rate in System Settings
- **THEN** all subsequent checkout calculations SHALL use the new rate; existing order records retain their original deposit amounts

#### Scenario: Product form displays deposit rate as read-only
- **WHEN** a shop owner views a water product form
- **THEN** the deposit amount field SHALL display the current platform rate for the selected can size and SHALL be non-editable by the shop owner

### Requirement: Pending can warning at 2 pending cans (in-app only)
When a customer's `pending_cans` for any can size reaches 2, the system SHALL display a persistent in-app warning banner on the Home screen and a highlighted warning at checkout. No push notification is sent for the warning threshold.

#### Scenario: Warning banner shown at pending_cans = 2
- **WHEN** a customer's `pending_cans` for any can size equals 2
- **THEN** the system SHALL log CAN0005 and display the warning banner: "You have [X] empty cans pending. Please return them to continue ordering."

#### Scenario: Warning banner hidden below threshold
- **WHEN** all of a customer's `pending_cans` values are below 2
- **THEN** the warning banner SHALL NOT appear on the Home screen

### Requirement: Checkout block at 3 or more pending cans
When a customer's `pending_cans` for any can size reaches 3, the system SHALL send a push notification and block the customer from completing checkout.

#### Scenario: Checkout blocked at pending_cans = 3
- **WHEN** a customer's `pending_cans` for any can size reaches 3
- **THEN** the system SHALL log CAN0006, send a push notification to the customer, and block checkout with: "Checkout blocked — [X] empty cans pending. Return cans or deposit will be charged."

#### Scenario: Customer can browse and add to cart but not complete order
- **WHEN** a customer's checkout is blocked due to pending cans
- **THEN** the system SHALL allow cart browsing and item additions but SHALL disable the Place Order button

#### Scenario: Block lifted after returning pending cans
- **WHEN** a delivery person marks an empty can as collected, reducing `pending_cans` below 3
- **THEN** the checkout block SHALL lift automatically on the customer's next session

#### Scenario: Block lifted after paying deposit at checkout
- **WHEN** a customer pays the deposit for pending cans at checkout
- **THEN** the pending cans are treated as deposit-paid and checkout proceeds; `pending_cans` does not immediately change but is no longer blocking

### Requirement: Deposit refund applied as real-time discount when can is returned
When a delivery person marks an empty can as collected, the system SHALL calculate a refund and apply it as a real-time discount on the current order. Excess credit is stored in `customer_deposit_balance`.

#### Scenario: Can returned — deposit refunded as discount on current order
- **WHEN** a delivery person marks "Empty can collected" for an order
- **THEN** the system SHALL calculate refund = returned_cans × deposit_rate_for_that_size and apply it as a discount reducing the current order total

#### Scenario: Refund exceeds current order total — excess credited
- **WHEN** the deposit refund amount exceeds the current order total
- **THEN** the system SHALL log CAN0009, reduce the current order total to ₹0, and credit the excess to `customer_deposit_balance`

#### Scenario: Deposit credit auto-applied on next order
- **WHEN** a customer with `customer_deposit_balance > 0` reaches checkout
- **THEN** the system SHALL log CAN0008 and automatically apply the deposit credit as a discount line item "Deposit Credit: −₹[X]"; the customer balance SHALL reduce by the applied amount

### Requirement: Cancel-after-pickup deposit handling
If an order is cancelled after the Picked state, the deposit charged on that order SHALL always be refunded 100% separately, regardless of the UPI tier refund applied to the rest of the order. `pending_cans` SHALL NOT be incremented on cancel-after-pickup.

#### Scenario: Cancel-after-pickup — deposit refunded separately
- **WHEN** a customer cancels an order after the Picked state and a deposit was charged
- **THEN** the system SHALL refund the deposit 100% separately from the order total; the UPI tiered refund applies only to the non-deposit portion of the order

#### Scenario: Cancel-after-pickup — pending_cans not incremented
- **WHEN** an order is cancelled after Picked
- **THEN** the customer's `pending_cans` SHALL NOT change, because the can was never delivered to the customer

### Requirement: total_cans_given increments on delivery confirmation
`total_cans_given` SHALL increment by the quantity of water can products delivered when an order is marked as Delivered.

#### Scenario: Water order delivered — total_cans_given incremented
- **WHEN** a delivery person marks a water product order as Delivered
- **THEN** the customer's `total_cans_given` for the matching can size SHALL increment by the quantity of water cans in the order

#### Scenario: Non-water order delivered — no can balance change
- **WHEN** a delivery person marks a non-water order as Delivered
- **THEN** neither `total_cans_given` nor `total_cans_returned` SHALL change
