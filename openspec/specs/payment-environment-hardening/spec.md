## ADDED Requirements

### Requirement: Razorpay Native Production Checkout
Production mobile builds SHALL use `react-native-razorpay` for checkout and SHALL NOT use WebView payment checkout as the production path.

#### Scenario: Production payment is started
- **WHEN** a production build starts Razorpay checkout
- **THEN** the app opens the native Razorpay SDK with backend-created order details and no WebView checkout path

#### Scenario: Native SDK is unavailable in production
- **WHEN** the native Razorpay module cannot be loaded in a production build
- **THEN** the app blocks checkout with a clear error and logs the configuration failure instead of silently falling back to WebView

### Requirement: Dev-Only WebView Fallback
WebView Razorpay checkout SHALL be available only for Expo Go or explicit development/testing builds.

#### Scenario: Expo Go checkout is tested
- **WHEN** the app is running in an approved dev/testing environment without native Razorpay support
- **THEN** the WebView fallback may be used and the UI clearly routes through the same verification and failure handling as native checkout

#### Scenario: Release build is created
- **WHEN** a release build is prepared
- **THEN** build-time or runtime checks prevent dev WebView payment behavior from becoming the active production payment path

### Requirement: Payment Attempt Lifecycle
Payment handling SHALL track create-order, SDK open, success, verification, failure, cancel, timeout, retry, and final order update states idempotently.

#### Scenario: Payment succeeds
- **WHEN** Razorpay returns a successful payment response
- **THEN** the app sends payment id, order id, and signature to the backend for verification before showing final order success

#### Scenario: Payment fails
- **WHEN** Razorpay returns failure, network failure, timeout, or user cancellation
- **THEN** the app records the failed attempt, shows a clear recovery message, and offers a safe retry without duplicating the order

#### Scenario: Backend verification fails
- **WHEN** the SDK reports success but backend signature verification or capture validation fails
- **THEN** the app does not mark the order as paid and shows a supportable failure state with retry or contact guidance
