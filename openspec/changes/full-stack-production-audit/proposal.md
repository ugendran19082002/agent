## Why

ThanniGo needs a complete production-readiness audit across the Expo app, Node API, MySQL schema, Razorpay flow, and Ubuntu/Nginx deployment before further feature work. The current system has many production surfaces and prior hardening work, but it still needs a structured file-by-file review that turns failures, success paths, UI states, reusable patterns, and environment differences into explicit requirements and implementation tasks.

## What Changes

- Add a full-stack audit capability that inventories major frontend, backend, database, payment, config, and deployment files with issue, fix, priority, and verification notes.
- Add backend API contract hardening for validation, authentication, authorization, rate limiting, consistent success/error envelopes, and endpoint success/failure scenarios.
- Add frontend state and screen-flow hardening so every data screen and button action has predictable loading, success, empty, error, offline, retry, and crash states.
- Add Razorpay environment behavior requirements: native SDK for production builds, WebView only for Expo Go/dev testing, unified payment verification, retry, cancel, and failure handling.
- Add database audit requirements for MySQL normalization, indexes, uniqueness/idempotency constraints, query performance, transactions, and edge-case consistency.
- Add production environment readiness checks for API URL configuration, secrets, Firebase/Razorpay keys, Nginx proxy behavior, logs, CORS, security headers, and no-localhost production releases.
- Add reusable architecture recommendations and code examples for API clients, controllers/services, validators, UI primitives, state stores, and payment adapters.

## Capabilities

### New Capabilities
- `full-stack-audit-report`: Requires a complete file-by-file audit report for major frontend, backend, database, payment, config, and deployment files, including clear issues, exact fixes, priorities, and verification steps.
- `api-contract-hardening`: Requires consistent Node/Express validation, auth, rate limiting, success/error response contracts, endpoint scenario coverage, and failure-safe logging.
- `mobile-state-ux-hardening`: Requires React Native screens and actions to expose user-friendly loading, success, error, empty, offline, retry, and crash states with reusable UI/state patterns.
- `payment-environment-hardening`: Requires Razorpay Native SDK in production, WebView only for Expo Go/dev testing, and robust success/failure/cancel/network retry behavior.
- `mysql-integrity-performance-audit`: Requires schema, index, transaction, idempotency, normalization, and query-performance review for MySQL-backed flows.
- `production-deployment-readiness`: Requires production config checks for environment variables, API URL selection, Ubuntu/Nginx behavior, logging, security headers, CORS, and release validation.

### Modified Capabilities
None.

## Impact

- **Frontend:** `frontend/app/**`, `frontend/api/**`, `frontend/components/**`, `frontend/providers/**`, `frontend/stores/**`, `frontend/lib/schemas/**`, `frontend/hooks/**`, `frontend/utils/**`, `frontend/constants/**`, `frontend/styles/**`, `frontend/app.json`, `frontend/eas.json`, `frontend/package.json`.
- **Backend:** `backend/src/app.js`, `backend/src/server.js`, `backend/src/routes/**`, `backend/src/controllers/**`, `backend/src/services/**`, `backend/src/middleware/**`, `backend/src/validations/**`, `backend/src/model/**`, `backend/src/config/**`, `backend/src/utils/**`, `backend/src/scripts/**`, `backend/package.json`.
- **Database:** Sequelize model definitions, schema sync/migration scripts, MySQL indexes, foreign keys, unique constraints, idempotency fields, payment/order consistency, and query plans for high-traffic paths.
- **Payments:** `frontend/api/paymentApi.ts`, checkout/payment screens and helpers, `frontend/assets/scripts/razorpay.js`, `backend/src/services/payment/PaymentService.js`, `backend/src/routes/v1/payment/payment.routes.js`, `backend/src/model/Payment*.js`, Razorpay webhook/idempotency handling.
- **Server/deployment:** Ubuntu/Nginx reverse proxy expectations, production API base URL, CORS origins, TLS, logs, process management, environment variable handling, and release checklist.
- **Dependencies:** No new dependency is required by the proposal itself; implementation may add audit tooling or tests only when justified by the findings.
