## ADDED Requirements

### Requirement: Decomposed Checkout Component
The `checkout.tsx` screen SHALL be refactored into focused, reusable sub-components.

#### Scenario: Component Rendering
- **WHEN** the checkout screen is rendered
- **THEN** it SHALL compose `OrderSummary`, `AddressSelector`, `PaymentMethodSelector`, `BillBreakdown`, `CouponInput`, `AvailableCoupons`, and `DepositLineItem` components

### Requirement: Atomic State Management in Checkout
Each sub-component of the checkout SHALL manage its own UI logic while reporting state changes to the parent.

#### Scenario: Coupon Application
- **WHEN** a user enters a coupon in the `CouponInput` sub-component OR taps a coupon in `AvailableCoupons`
- **THEN** the sub-component SHALL handle the validation UI and notify the parent checkout state of the discount change

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

### Requirement: Shop-blocked customer cannot reach checkout
If the customer is blocked at the target shop, the checkout screen SHALL display a blocking message and prevent order submission.

#### Scenario: Checkout blocked for blocked customer
- **WHEN** a customer who is blocked at the selected shop opens the checkout
- **THEN** the checkout SHALL display a message "You are currently unable to place orders at this shop" and disable the Place Order button

#### Scenario: Checkout proceeds normally for unblocked customer
- **WHEN** a customer who is not blocked opens the checkout
- **THEN** the checkout SHALL load and function normally

### Requirement: Available coupons panel in checkout
The checkout screen SHALL display a list of eligible coupons the customer can apply with a single tap.

#### Scenario: Eligible coupons shown
- **WHEN** the customer opens checkout and eligible coupons exist for the shop
- **THEN** the `AvailableCoupons` component SHALL display each coupon's discount and expiry
- **AND** tapping a coupon SHALL fill the coupon code input and trigger validation

#### Scenario: No eligible coupons — panel hidden
- **WHEN** no eligible coupons are found for the customer/shop combination
- **THEN** the `AvailableCoupons` component SHALL not be rendered
