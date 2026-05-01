## 1. Audit Inventory And Report Structure

- [ ] 1.1 Create an audit register document for findings with severity, affected files, exact fix, best-practice rationale, user impact, and verification fields
- [ ] 1.2 Inventory major frontend files under `frontend/app`, `frontend/api`, `frontend/components`, `frontend/providers`, `frontend/stores`, `frontend/hooks`, `frontend/lib`, `frontend/utils`, `frontend/styles`, and frontend config files
- [ ] 1.3 Inventory major backend files under `backend/src/routes`, `backend/src/controllers`, `backend/src/services`, `backend/src/model`, `backend/src/middleware`, `backend/src/validations`, `backend/src/config`, `backend/src/utils`, and backend scripts
- [ ] 1.4 Inventory payment, database, environment, Firebase, Razorpay, Ubuntu/Nginx, package, and build configuration surfaces
- [ ] 1.5 Record duplicate logic, oversized files, inconsistent structure, missing reusable primitives, and unclear ownership boundaries

## 2. Backend API Audit And Hardening Plan

- [ ] 2.1 Map all `/v1` routes to controller, service, validation, auth, role, and rate-limit behavior
- [ ] 2.2 Document success and failure scenarios for auth, user, shop, order, delivery, payment, payout, admin, upload, support, engagement, and system endpoints
- [ ] 2.3 Identify endpoints missing request validation, authorization checks, rate limiting, consistent response envelopes, or sanitized errors
- [ ] 2.4 Review global middleware for CORS, Helmet, HPP, XSS, body limits, upload constraints, logging, and error handling
- [ ] 2.5 Produce exact backend fixes and code examples for validators, controller/service separation, error codes, response utilities, transactions, and logging

## 3. Frontend Screen, State, And UI Audit

- [ ] 3.1 Map all customer, auth, shop, delivery, and admin screen flows including route guards and role switching behavior
- [ ] 3.2 Audit every data screen for loading, success, empty, error, offline, retry, and crash-containment UI states
- [ ] 3.3 Audit every critical button action for disabled/submitting state, duplicate submission protection, success message, validation error, API error, and network error feedback
- [ ] 3.4 Identify non-reusable screen logic and recommend shared hooks, API helpers, store patterns, and existing UI primitives
- [ ] 3.5 Review visual consistency, responsive mobile behavior, user-friendly wording, empty states, and role-specific UX for attractive app experience

## 4. Razorpay Payment Audit

- [ ] 4.1 Trace frontend payment entry points, payment API calls, Razorpay native usage, WebView fallback usage, and checkout success/failure callbacks
- [ ] 4.2 Trace backend Razorpay order creation, payment verification, webhook handling, payment attempts, refunds, and idempotency behavior
- [ ] 4.3 Verify production builds use `react-native-razorpay` and WebView checkout is limited to Expo Go or explicit dev/testing behavior
- [ ] 4.4 Document payment success, failed payment, user cancel, network timeout, duplicate tap, verification failure, webhook replay, and retry scenarios
- [ ] 4.5 Produce exact fixes and code examples for a reusable frontend payment adapter and backend verification/idempotency handling

## 5. MySQL Database Audit

- [ ] 5.1 Review Sequelize models for normalization, associations, foreign keys, unique constraints, nullable fields, defaults, status values, and timestamps
- [ ] 5.2 Review order, payment, wallet, payout, refund, inventory, delivery assignment, OTP, refresh token, and webhook consistency rules
- [ ] 5.3 Review indexes and duplicate index cleanup scripts for high-traffic auth, shop, product, order, delivery, payment, payout, and admin query paths
- [ ] 5.4 Identify transaction gaps and partial-write risks in multi-table order, payment, inventory, wallet, payout, and refund flows
- [ ] 5.5 Produce exact SQL/model/script recommendations with migration, rollback, and staging verification notes

## 6. Production Readiness Audit

- [ ] 6.1 Review environment variable loading and production-safe configuration for API URL, database, Redis, Razorpay, Firebase, SMTP, JWT, CORS, and feature flags
- [ ] 6.2 Identify localhost, dev-only, hardcoded, or committed-secret risks in frontend, backend, Firebase, Razorpay, and deployment files
- [ ] 6.3 Review Ubuntu/Nginx expectations for reverse proxy headers, TLS, body limits, timeouts, static/upload paths, health checks, logs, and process restart
- [ ] 6.4 Produce a release checklist covering backend startup, frontend lint/type/build readiness, native payment behavior, DB connectivity, API health, and role smoke flows

## 7. Final Audit Deliverable

- [ ] 7.1 Write the final audit report with prioritized issues, exact fixes, best-practice recommendations, and code examples where useful
- [ ] 7.2 Include file-by-file notes for all major frontend, backend, config, payment, database, and deployment areas reviewed
- [ ] 7.3 Include failure scenario coverage for API failure, network failure, payment failure, invalid input, duplicate action, unauthorized access, and app crash cases
- [ ] 7.4 Include success scenario coverage for login, API response handling, payment success verification, order flow, and navigation correctness
- [ ] 7.5 Run available non-destructive verification commands and document any commands that cannot be run locally
