## ADDED Requirements

### Requirement: Use Native Razorpay SDK in Production
The system SHALL use `react-native-razorpay` for all payment processing in production builds.

#### Scenario: Production Payment Trigger
- **WHEN** the app is running in a production environment and a payment is initiated
- **THEN** the system SHALL invoke the native Razorpay SDK checkout

### Requirement: Development WebView Fallback
The system SHALL fall back to a WebView-based Razorpay implementation when running in development mode (`__DEV__`).

#### Scenario: Dev Mode Payment Trigger
- **WHEN** the app is running in `__DEV__` mode (e.g., Expo Go) and a payment is initiated
- **THEN** the system SHALL use the WebView-based checkout for compatibility

### Requirement: Unified Payment Callbacks
The payment system SHALL provide unified success, failure, and dismissal callbacks regardless of the underlying implementation (Native or WebView).

#### Scenario: Successful Payment Callback
- **WHEN** a payment is completed successfully in either Native or WebView
- **THEN** the system SHALL return a typed response containing `razorpay_payment_id` and `razorpay_signature`
