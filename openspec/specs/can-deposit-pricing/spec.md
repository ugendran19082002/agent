## REMOVED Requirements

### Requirement: Deposit applied only to water products
**Reason**: Superseded by the `water-can-pending-system` spec which fully redefines deposit logic with per-can-size tracking, pending_cans model, and platform-wide Admin-managed rates.
**Migration**: All deposit calculation logic now lives in `water-can-pending-system`. Remove any per-product `deposit_amount` field that is editable by shop owners; replace with a read-only display of the platform rate from System Settings.

### Requirement: Deposit charged when customer can balance is zero
**Reason**: Superseded. The balance model (single `user_can_balance`) is replaced by `pending_cans` per can size in `water-can-pending-system`.
**Migration**: Read `pending_cans` from `customer_can_balance` table instead of `user_can_balance`.

### Requirement: No deposit charged when customer has an empty can available
**Reason**: Superseded. Equivalent logic now defined in `water-can-pending-system` using `pending_cans > 0` check.
**Migration**: Use `pending_cans > 0` condition from `customer_can_balance` table.

### Requirement: Deposit amount stored immutably on order
**Reason**: Retained but restated in `water-can-pending-system` with additional fields (`deposit_reason`, `deposit_refunded`).
**Migration**: The deposit immutability rule still applies; ensure order record stores the rate from System Settings at time of order, not product-level deposit_amount.

## ADDED Requirements

### Requirement: Deposit rates stored platform-wide in System Settings, not on product
The deposit amounts for 20L and 10L cans SHALL be stored as System Setting key/value pairs (`deposit_20l`, `deposit_10l`) and managed exclusively by Admin. Shop owners SHALL NOT be able to set or override deposit amounts.

#### Scenario: Deposit rate read from System Settings at checkout
- **WHEN** a water product order is placed
- **THEN** the system SHALL read the current deposit rate for the product's `can_size` from System Settings and store it immutably on the order record

#### Scenario: Shop owner views deposit on product form
- **WHEN** a shop owner opens the product edit form for a water product
- **THEN** the deposit amount field SHALL be read-only and display the current platform rate for the selected can size

#### Scenario: Shop owner cannot edit deposit amount
- **WHEN** a shop owner attempts to modify the deposit amount field on a water product
- **THEN** the system SHALL reject the edit; the field SHALL remain read-only and controlled by Admin only
