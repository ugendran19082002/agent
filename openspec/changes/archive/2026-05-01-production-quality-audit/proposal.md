## Why

The app is functionally complete but has several production-blocking gaps: the Razorpay checkout uses a slow WebView instead of the already-installed native SDK, the `orders` table has 15 duplicate indexes causing write overhead, the checkout screen is 2451 lines with mixed concerns, and UI loading/error/empty states are inconsistently applied across screens. Fixing these now prevents UX degradation, query slowdowns, and payment failures at scale.

## What Changes

### Razorpay
- Replace the `generateRazorpayHtml` WebView checkout in `checkout.tsx` with `react-native-razorpay` native SDK (already in `package.json`)
- Keep WebView path behind a dev-only `__DEV__` flag for Expo Go compatibility
- Add proper success / failure / dismiss callbacks with typed responses

### DB — Duplicate Index Cleanup
- **BREAKING (performance):** Remove 14 redundant duplicate indexes on `orders.order_number`, `orders.idempotency_key`, and `orders.razorpay_order_id` (15 copies each, only 1 needed per column)
- Audit and clean duplicate indexes on any other tables with the same problem

### Backend Best Practices
- Add `express-validator` request validation to routes currently missing it (order, payment, delivery routes)
- Ensure every service function returns a typed, predictable result — no silent `null` returns without documented meaning
- Standardise error codes in `sendError` calls (replace ad-hoc strings with constants from `statusCodes.js`)

### Frontend — UI State Consistency
- Apply `Skeleton.tsx` loading states on all list/data screens that currently show a blank view while fetching
- Apply `EmptyState.tsx` on all screens that can return zero results
- Ensure every async action (place order, verify payment, update profile) shows an in-progress indicator and a clear success or failure toast via `AppToast`
- Wire `ErrorBoundary.tsx` at the route-group level for crash containment

### Frontend — Checkout Refactor
- Split `checkout.tsx` (2451 lines) into focused files: `OrderSummary`, `AddressSelector`, `PaymentMethodSelector`, `BillBreakdown`, `CouponInput`

## Capabilities

### New Capabilities
- `razorpay-native-sdk`: Replace WebView checkout with react-native-razorpay native SDK; keep WebView as `__DEV__` fallback
- `db-index-cleanup`: Migration script to drop duplicate indexes from `orders` and any other affected tables
- `backend-validation`: Add express-validator schemas to order, payment, and delivery route handlers
- `ui-state-consistency`: Skeleton loaders, empty states, success/error toasts, and ErrorBoundary applied uniformly across all screens
- `checkout-refactor`: Decompose `checkout.tsx` into co-located sub-components

### Modified Capabilities

## Impact

- **Frontend:** `app/order/checkout.tsx`, all tab and feature screens, `app/_layout.tsx`
- **Backend:** `routes/v1/order/`, `routes/v1/payment/`, `routes/v1/delivery/`, `utils/response.js`, `constants/statusCodes.js`
- **DB:** `orders` table index definitions; a new migration script in `backend/src/scripts/`
- **Dependencies:** `react-native-razorpay` promoted from installed-but-unused to actively used
