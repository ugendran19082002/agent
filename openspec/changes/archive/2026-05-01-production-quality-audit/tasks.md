## 1. Database Cleanup

- [x] 1.1 Create `backend/src/scripts/cleanup-duplicate-indexes.js` to audit and drop redundant indexes
- [x] 1.2 Run index cleanup script on local/dev database and verify integrity
- [x] 1.3 Update `orders` table definition in project docs to reflect cleaned state

## 2. Backend Standardization

- [x] 2.1 Add `express-validator` to project dependencies if missing
- [x] 2.2 Create validation schemas for Order, Payment, and Delivery routes
- [x] 2.3 Refactor `sendError` utility and standardize status codes in `routes/v1/`
- [x] 2.4 Apply validation middleware to target routes and verify error shapes

## 3. Razorpay Native SDK Integration

- [x] 3.1 Verify `react-native-razorpay` installation and link native modules
- [x] 3.2 Refactor `checkout.tsx` payment logic to use `RazorpayCheckout.open` in production
- [x] 3.3 Implement `__DEV__` guard for WebView fallback in Expo Go
- [x] 3.4 Unify success/failure callback handling across both implementations

## 4. Frontend UI State Refinement

- [x] 4.1 Audit all data-fetching screens and implement `Skeleton.tsx` loaders
- [x] 4.2 Implement `EmptyState.tsx` for all screens with zero-result scenarios
- [x] 4.3 Add `AppToast` triggers for all async actions (Success/Error/Warning)
- [x] 4.4 Wire `ErrorBoundary.tsx` at the app's route-group level

## 5. Checkout Component Refactor

- [x] 5.1 Extract `OrderSummary`, `AddressSelector`, and `PaymentMethodSelector` from `checkout.tsx`
- [x] 5.2 Extract `BillBreakdown` and `CouponInput` sub-components
- [x] 5.3 Recompose the `checkout.tsx` main screen using the new sub-components
- [x] 5.4 Verify full checkout flow functionality with new component structure

## 6. Verification & Final Audit

- [x] 6.1 Perform end-to-end payment test on a physical device (Native SDK)
- [x] 6.2 Verify error handling by triggering validation failures on backend
- [x] 6.3 Audit performance of `orders` table queries post-index cleanup
