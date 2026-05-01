## ADDED Requirements

### Requirement: Endpoint Contract Documentation
Every backend endpoint SHALL have an explicit contract covering method, path, auth requirement, role requirement, request validation, success response, failure responses, and rate-limit behavior.

#### Scenario: Endpoint accepts valid input
- **WHEN** a request satisfies authentication, authorization, validation, and business rules
- **THEN** the endpoint returns a consistent success envelope with the expected HTTP status and data shape

#### Scenario: Endpoint receives invalid input
- **WHEN** a request fails validation
- **THEN** the endpoint returns a consistent validation error envelope without entering business service logic

#### Scenario: Endpoint receives unauthorized request
- **WHEN** a request has no valid token or has the wrong role
- **THEN** the endpoint returns the correct authentication or authorization error without leaking private data

### Requirement: Centralized Error Handling
The backend SHALL route thrown errors and rejected promises through centralized error handling and SHALL avoid ad-hoc response shapes.

#### Scenario: Service throws known business error
- **WHEN** a service detects a business-rule failure such as unavailable slot, duplicate order, invalid payment, or missing shop permission
- **THEN** the controller returns a stable error code, message, and HTTP status consumable by the frontend

#### Scenario: Unexpected error occurs
- **WHEN** an unexpected exception occurs
- **THEN** the API logs the internal error with request context and returns a sanitized generic response to the client

### Requirement: Security Middleware Coverage
The backend SHALL apply appropriate security controls for auth, role checks, validation, rate limiting, CORS, headers, XSS protection, upload constraints, and webhook verification.

#### Scenario: Public endpoint is abused
- **WHEN** repeated requests exceed the configured limit for auth, OTP, payment, upload, or public lookup endpoints
- **THEN** the API rejects additional requests with a rate-limit response

#### Scenario: Webhook request is received
- **WHEN** Razorpay sends a webhook event
- **THEN** the API verifies the signature, persists the event idempotently, and rejects invalid signatures
