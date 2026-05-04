## ADDED Requirements

### Requirement: OrderService Facade
`backend/src/services/order/OrderService.js` SHALL be refactored into a thin re-export facade. All named exports that currently exist in `OrderService.js` SHALL remain importable from `OrderService.js` without any change to importing controllers or services. The facade SHALL re-export from the four new sub-service files.

#### Scenario: Existing controller import unchanged
- **WHEN** `order.controller.js` imports `{ placeOrder }` from `../services/order/OrderService.js`
- **THEN** the import resolves correctly to the implementation in `OrderPlacementService.js` via the facade re-export

#### Scenario: No behavior change on order placement
- **WHEN** a customer places an order via `POST /api/v1/orders` after the decomposition
- **THEN** the response, side effects, database writes, and error handling are identical to pre-decomposition behavior

### Requirement: OrderPlacementService
A new file `backend/src/services/order/OrderPlacementService.js` SHALL contain all logic for order creation: checkout validation guards (pending-can block, COD block, min order value), idempotency key check, deposit calculation, loyalty redemption, coupon application, price breakdown computation, Razorpay order creation, and inventory reservation. This file SHALL have no more than 600 lines.

#### Scenario: Placement logic is isolated
- **WHEN** `OrderPlacementService.js` is read in isolation
- **THEN** it contains only functions that are called at the moment of order creation and has no cancellation, switch-shop, or query logic

### Requirement: OrderCancellationService
A new file `backend/src/services/order/OrderCancellationService.js` SHALL contain: `restoreOrderPlacementSideEffects`, the before/after-pickup cancellation logic, UPI tiered refund calculation, COD failed-delivery control updates, return-to-shop flow trigger, and `initiatePrepaidRefundFullCancel`. This file SHALL have no more than 500 lines.

#### Scenario: Cancellation logic is isolated
- **WHEN** `OrderCancellationService.js` is read in isolation
- **THEN** it contains only functions related to order cancellation, refund initiation, and can-return side effects

### Requirement: OrderSwitchService
A new file `backend/src/services/order/OrderSwitchService.js` SHALL contain: `findBestShop`, `findMatchedProductForSwitch`, `accumulateSwitchLineTotals`, `computeSwitchOrderTotal`, and the switch-shop confirmation logic. This file SHALL have no more than 400 lines.

#### Scenario: Switch logic is isolated
- **WHEN** `OrderSwitchService.js` is read in isolation
- **THEN** it contains only functions related to finding an alternative shop, computing price differences, and completing a switch action

### Requirement: OrderQueryService
A new file `backend/src/services/order/OrderQueryService.js` SHALL contain: order history retrieval, order detail fetch, order status log queries, and `shopHasInventoryForOrderItems`. This file SHALL have no more than 300 lines.

#### Scenario: Query logic is isolated
- **WHEN** `OrderQueryService.js` is read in isolation
- **THEN** it contains only read-only or near-read-only functions that retrieve order data without triggering side effects

### Requirement: Sub-service Line Limits
Each decomposed sub-service file SHALL have a line count within the stated limits to prevent the God-object pattern from re-emerging. The limits are: `OrderPlacementService.js` ≤ 600 lines, `OrderCancellationService.js` ≤ 500 lines, `OrderSwitchService.js` ≤ 400 lines, `OrderQueryService.js` ≤ 300 lines.

#### Scenario: Sub-service is within line limit
- **WHEN** `wc -l` is run on any decomposed sub-service file
- **THEN** the output is at or below the stated limit for that file
