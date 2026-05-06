## MODIFIED Requirements

### Requirement: Conditional deposit line item in order pricing breakdown
The checkout pricing breakdown SHALL display deposit-related line items based on the PRD v2.1 water can pending model. The breakdown SHALL include: Pending Can Deposit (auto-added if unpaid deposit exists for pending cans), and Deposit Credit (auto-subtracted from `customer_deposit_balance` if balance > 0). The PRD requires both new line items, not just a single deposit line.

#### Scenario: Deposit shown when customer has no empty can (pending_cans = 0)
- **WHEN** an authenticated customer with `pending_cans = 0` for the ordered can size views the checkout for a water product
- **THEN** the `BillBreakdown` SHALL display a "Pending Can Deposit" line item with the platform deposit rate for that can size
- **AND** the total SHALL reflect water price + deposit amount

#### Scenario: No deposit shown when customer has pending can to return
- **WHEN** an authenticated customer with `pending_cans > 0` for the relevant can size views checkout
- **THEN** the `BillBreakdown` SHALL NOT display a "Pending Can Deposit" line item
- **AND** the total SHALL reflect water price only

#### Scenario: Deposit credit auto-applied from customer_deposit_balance
- **WHEN** an authenticated customer has `customer_deposit_balance > 0` at checkout
- **THEN** the `BillBreakdown` SHALL display a "Deposit Credit: −₹[X]" line item and the balance SHALL be auto-applied to reduce the order total

#### Scenario: Deposit line not shown for non-water products
- **WHEN** the cart contains only non-water products
- **THEN** the `BillBreakdown` SHALL NOT display any deposit-related line items

## ADDED Requirements

### Requirement: Checkout block enforcement at pending_cans >= 3
The checkout screen SHALL disable the Place Order button and display a block notice when the customer's `pending_cans` for any can size is at or above the block threshold (default 3, configurable via System Settings).

#### Scenario: Place Order disabled at pending can block threshold
- **WHEN** a customer with `pending_cans >= 3` for any can size reaches the checkout screen
- **THEN** the Place Order button SHALL be disabled and the screen SHALL display: "Checkout blocked — [X] empty cans pending. Return cans or deposit will be charged."

#### Scenario: Place Order re-enabled after pending cans reduced
- **WHEN** a customer's `pending_cans` falls below the block threshold
- **THEN** the Place Order button SHALL be enabled again on the checkout screen

### Requirement: Pending can warning shown at checkout when pending_cans = 2
When a customer's `pending_cans` is at the warning threshold (2), a highlighted warning SHALL appear in the checkout summary, in addition to the home screen banner.

#### Scenario: Warning displayed in checkout at warning threshold
- **WHEN** a customer with `pending_cans = 2` views the checkout screen
- **THEN** a highlighted warning notice SHALL be shown in the checkout: "You have [X] empty cans pending. Please return them to continue ordering."

### Requirement: COD option disabled for customers with cod_blocked = true
The payment method selection on the checkout screen SHALL disable the COD option and show an explanation when the customer's `cod_blocked` is true.

#### Scenario: COD option disabled for blocked customer
- **WHEN** a customer with `cod_blocked = true` reaches payment method selection
- **THEN** the COD option SHALL appear disabled with the label "COD unavailable" and a sub-message explaining the reason

### Requirement: Order placement idempotency via client-generated UUID
The order placement endpoint SHALL accept a client-generated UUID as an idempotency key with every request. Duplicate requests bearing the same key within a 10-minute window SHALL return the same order ID without creating a second order.

#### Scenario: Place Order with new idempotency key
- **WHEN** a client submits a Place Order request with a UUID idempotency key not seen in the last 10 minutes
- **THEN** the system SHALL create the order, persist the idempotency key, and return the new order ID

#### Scenario: Duplicate Place Order request within 10 minutes
- **WHEN** a client submits a Place Order request with the same idempotency key as a prior request within 10 minutes
- **THEN** the system SHALL log PAY0004, NOT create a second order, and return the same order ID as the prior successful response

#### Scenario: Place Order without idempotency key
- **WHEN** a client submits a Place Order request without an idempotency key header
- **THEN** the system SHALL reject the request with a 400 status and a message instructing the client to include `Idempotency-Key`

### Requirement: Razorpay payment verification idempotency
The payment verification endpoint SHALL be idempotent. Repeated calls with the same Razorpay order ID SHALL return the same verification result without re-processing the payment.

#### Scenario: First verification call
- **WHEN** the client posts a Razorpay verification with a Razorpay order ID
- **THEN** the system SHALL verify the signature, update the payment record, and return the verification result

#### Scenario: Repeated verification call after network drop
- **WHEN** the client posts a duplicate verification call for the same Razorpay order ID
- **THEN** the system SHALL return the previously stored verification result without re-processing or double-charging the customer
