## ADDED Requirements

### Requirement: Deposit applied only to water products
The system SHALL apply deposit logic exclusively to products where `is_water = true`. Non-water products SHALL never incur a deposit charge.

#### Scenario: Non-water product order
- **WHEN** a customer orders a product with `is_water = false`
- **THEN** the system SHALL calculate total as water price only, with no deposit component

#### Scenario: Water product order
- **WHEN** a customer orders a product with `is_water = true`
- **THEN** the system SHALL evaluate the customer's can balance before computing the final total

### Requirement: Deposit charged when customer can balance is zero
The system SHALL add the product's `deposit_amount` to the order total when the ordering customer's `user_can_balance` is zero (no empty can available to return).

#### Scenario: New customer first order
- **WHEN** a new customer with `cans_given = 0` and `cans_returned = 0` places a water product order
- **THEN** the order total SHALL equal `water_price + deposit_amount`
- **AND** `deposit_required = true` and `deposit_amount` SHALL be stored on the order record

#### Scenario: Customer with no remaining can balance
- **WHEN** a customer whose `cans_given = cans_returned` (balance = 0) places a water product order
- **THEN** the order total SHALL equal `water_price + deposit_amount`

### Requirement: No deposit charged when customer has an empty can available
The system SHALL charge only the water price when the customer's can balance is greater than zero (they hold at least one can to return).

#### Scenario: Customer with available empty can
- **WHEN** a customer with `cans_given > cans_returned` (balance > 0) places a water product order
- **THEN** the order total SHALL equal `water_price` only
- **AND** `deposit_required = false` and `deposit_amount = 0` SHALL be stored on the order record

### Requirement: Deposit amount stored immutably on order
The deposit amount included in an order SHALL be stored on the order record at creation time and SHALL NOT be recalculated after the order is placed.

#### Scenario: Balance changes after order placement
- **WHEN** a customer's can balance changes after an order has been placed
- **THEN** the deposit amount on the existing order SHALL remain unchanged
