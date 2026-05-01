## MODIFIED Requirements

### Requirement: Decomposed Checkout Component
The `checkout.tsx` screen SHALL be refactored into focused, reusable sub-components.

#### Scenario: Component Rendering
- **WHEN** the checkout screen is rendered
- **THEN** it SHALL compose `OrderSummary`, `AddressSelector`, `PaymentMethodSelector`, `BillBreakdown`, `CouponInput`, and `DepositLineItem` components

### Requirement: Atomic State Management in Checkout
Each sub-component of the checkout SHALL manage its own UI logic while reporting state changes to the parent.

#### Scenario: Coupon Application
- **WHEN** a user enters a coupon in the `CouponInput` sub-component
- **THEN** the sub-component SHALL handle the validation UI and notify the parent checkout state of the discount change

## ADDED Requirements

### Requirement: Conditional deposit line item in order pricing breakdown
The checkout pricing breakdown SHALL display a deposit line when the order includes a deposit charge, and SHALL show ₹0 or hide the deposit line when no deposit applies.

#### Scenario: Deposit shown when customer has no empty can
- **WHEN** an authenticated customer with can balance = 0 views the checkout for a water product
- **THEN** the `BillBreakdown` SHALL display a "Deposit" line item with the deposit amount
- **AND** the total SHALL reflect water price + deposit amount

#### Scenario: Deposit hidden when customer has empty can to return
- **WHEN** an authenticated customer with can balance > 0 views the checkout for a water product
- **THEN** the `BillBreakdown` SHALL display "Deposit: ₹0" or omit the deposit line entirely
- **AND** the total SHALL reflect water price only

#### Scenario: Deposit line not shown for non-water products
- **WHEN** the cart contains only non-water products
- **THEN** the `BillBreakdown` SHALL NOT display any deposit line item
