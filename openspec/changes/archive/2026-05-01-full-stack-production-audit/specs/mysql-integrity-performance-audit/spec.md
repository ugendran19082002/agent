## ADDED Requirements

### Requirement: Schema Integrity Review
The database audit SHALL review Sequelize models and MySQL schema for normalization, foreign keys, unique constraints, nullable fields, default values, enum/status values, and idempotency guarantees.

#### Scenario: Order or payment identity is reviewed
- **WHEN** the audit inspects order and payment tables
- **THEN** it verifies uniqueness for order numbers, provider order ids, idempotency keys, payment attempts, and webhook events

#### Scenario: Relationship is missing integrity protection
- **WHEN** a model relation can create orphaned, duplicated, or inconsistent records
- **THEN** the audit recommends the exact foreign key, unique constraint, transaction, or service guard required

### Requirement: Query And Index Review
The database audit SHALL review indexes and query patterns for high-traffic auth, shop listing, product, order, delivery, payment, payout, and admin analytics paths.

#### Scenario: Duplicate index is found
- **WHEN** two or more indexes provide the same effective coverage on a table
- **THEN** the audit identifies the redundant indexes and recommends a safe migration that preserves primary and unique constraints

#### Scenario: Missing index is found
- **WHEN** a frequent query filters, joins, or orders by columns without useful index coverage
- **THEN** the audit recommends an index and describes the expected query-path improvement

### Requirement: Transaction And Consistency Review
The database audit SHALL verify transaction boundaries for order creation, inventory changes, payment verification, wallet updates, payouts, refunds, and status logs.

#### Scenario: Multi-table write succeeds
- **WHEN** a business action writes multiple related tables
- **THEN** the action commits all related changes together and records an auditable status trail

#### Scenario: Multi-table write fails
- **WHEN** any write in a multi-table business action fails
- **THEN** the transaction rolls back and the API returns a recoverable error without partial customer-visible state
