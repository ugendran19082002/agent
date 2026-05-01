## ADDED Requirements

### Requirement: Decomposed Checkout Component
The `checkout.tsx` screen SHALL be refactored into focused, reusable sub-components.

#### Scenario: Component Rendering
- **WHEN** the checkout screen is rendered
- **THEN** it SHALL compose `OrderSummary`, `AddressSelector`, `PaymentMethodSelector`, `BillBreakdown`, and `CouponInput` components

### Requirement: Atomic State Management in Checkout
Each sub-component of the checkout SHALL manage its own UI logic while reporting state changes to the parent.

#### Scenario: Coupon Application
- **WHEN** a user enters a coupon in the `CouponInput` sub-component
- **THEN** the sub-component SHALL handle the validation UI and notify the parent checkout state of the discount change
