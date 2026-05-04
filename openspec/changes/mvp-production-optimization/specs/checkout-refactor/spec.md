## MODIFIED Requirements

### Requirement: Atomic State Management in Checkout
Each sub-component of the checkout SHALL manage its own UI logic while reporting state changes to the parent. The `placeOrder` call from the checkout screen SHALL invoke `OrderPlacementService` (not `OrderService` directly) via the existing order API layer, so that the service boundary aligns with the decomposed backend.

#### Scenario: Coupon Application
- **WHEN** a user enters a coupon in the `CouponInput` sub-component OR taps a coupon in `AvailableCoupons`
- **THEN** the sub-component SHALL handle the validation UI and notify the parent checkout state of the discount change

#### Scenario: Order placement routes through placement sub-service
- **WHEN** the customer taps Place Order on the checkout screen
- **THEN** the frontend calls `POST /api/v1/orders` whose handler delegates to `OrderPlacementService.placeOrder`, and the response shape is unchanged
