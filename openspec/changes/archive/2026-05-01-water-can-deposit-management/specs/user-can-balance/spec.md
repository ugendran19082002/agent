## ADDED Requirements

### Requirement: Per-user can balance ledger
The system SHALL maintain a `user_can_balance` record for every user with fields `cans_given` (integer, default 0) and `cans_returned` (integer, default 0). The effective balance SHALL be computed as `cans_given - cans_returned`.

#### Scenario: New user has zero balance
- **WHEN** a new user account is created
- **THEN** a `user_can_balance` record SHALL be created with `cans_given = 0` and `cans_returned = 0`

#### Scenario: Balance computation
- **WHEN** any part of the system queries a user's can balance
- **THEN** balance SHALL equal `cans_given - cans_returned`

### Requirement: Cans given increments on delivery confirmation
`cans_given` SHALL increment by the quantity of water product cans in an order when that order is marked as delivered.

#### Scenario: Order delivered with water cans
- **WHEN** an order containing 2 units of a water product is marked as delivered
- **THEN** the customer's `cans_given` SHALL increase by 2

#### Scenario: Order cancelled before delivery
- **WHEN** an order is cancelled before being marked delivered
- **THEN** `cans_given` SHALL NOT be incremented

### Requirement: Cans returned increments on collection confirmation
`cans_returned` SHALL increment by the number of empty cans confirmed collected by the delivery person at the time of delivery.

#### Scenario: Delivery person confirms empty can collected
- **WHEN** a delivery person marks "Empty can collected" for an order
- **THEN** `cans_returned` SHALL increment by the number of cans confirmed collected

#### Scenario: Delivery person marks empty not collected
- **WHEN** a delivery person marks "Empty not collected" for an order
- **THEN** `cans_returned` SHALL NOT increment for that delivery

### Requirement: Can balance exposed via API
The system SHALL provide an API endpoint that returns the authenticated customer's current can balance.

#### Scenario: Customer queries own balance
- **WHEN** an authenticated customer calls `GET /api/user/can-balance`
- **THEN** the response SHALL include `cans_given`, `cans_returned`, and `balance` fields
