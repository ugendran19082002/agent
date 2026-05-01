## Context

ThanniGo is a multi-role delivery marketplace with an Expo React Native frontend, Node/Express backend, Sequelize/MySQL persistence, Razorpay payments, Firebase notifications, Redis/BullMQ jobs, Socket.io realtime updates, and Ubuntu/Nginx deployment. The repo already contains useful primitives such as frontend API modules, Zustand stores, Zod schemas, `Skeleton`, `EmptyState`, `AppToast`, `ErrorBoundary`, backend validators, response utilities, payment models, webhook event storage, and DB cleanup scripts.

The audit must be implementation-oriented. It must not stop at broad recommendations; each finding must map to affected files, user-visible success/failure scenarios, concrete fixes, and verification steps. Payment behavior is a key constraint: production builds must use `react-native-razorpay`, while WebView is acceptable only for Expo Go or dev testing.

## Goals / Non-Goals

**Goals:**
- Produce a complete full-stack audit covering major frontend, backend, database, payment, config, and deployment files.
- Identify duplicate logic, poor structure, weak separation of concerns, missed validation, unreliable UI states, and production configuration risks.
- Convert findings into exact fixes with priority, affected files, success/failure scenarios, and verification commands or manual checks.
- Standardize backend endpoint contracts and frontend state handling so screens respond predictably to loading, success, error, empty, offline, and retry states.
- Confirm Razorpay production/dev behavior and document a reusable payment adapter pattern.
- Review MySQL model/index/transaction/idempotency behavior for order, payment, auth, shop, delivery, and payout flows.
- Check environment handling so production releases do not depend on localhost, dev WebView payment paths, or committed secrets.

**Non-Goals:**
- Rebuilding the app UI from scratch.
- Replacing Express, Sequelize, MySQL, Expo Router, Zustand, Razorpay, Firebase, Redis, or Nginx.
- Adding new business features unrelated to audit findings.
- Running destructive database cleanup on production without a reviewed migration and backup plan.
- Treating WebView checkout as production-ready.

## Decisions

### 1. Audit Output Is a Structured Finding Register
- **Decision:** Create a single audit register that groups findings by backend, frontend, database, payment, UI/UX, production readiness, and file-by-file notes.
- **Rationale:** The user requested a complete audit without missing major files. A finding register makes severity, owner area, affected files, exact fix, and verification explicit.
- **Alternative considered:** Free-form narrative audit. Rejected because it is harder to turn into implementation tasks and easier to miss failure scenarios.

### 2. Use Existing Architecture Before Adding New Patterns
- **Decision:** Prefer existing primitives: Express route/controller/service layers, `src/validations`, response utilities, frontend `api/*Api.ts`, stores, Zod schemas, UI primitives, and app providers.
- **Rationale:** Reusability improves faster when repeated local patterns are tightened instead of adding parallel abstractions.
- **Alternative considered:** Introduce a new frontend or backend framework layer. Rejected as too disruptive for an audit pass.

### 3. Backend Contracts Are Validated at the Route Boundary
- **Decision:** Each endpoint must define auth/role/rate-limit expectations, request validation, success response shape, failure response shape, and service-level failure handling.
- **Rationale:** This keeps invalid input, unauthorized actions, and inconsistent errors from leaking into business logic or frontend state.
- **Alternative considered:** Validate only in services. Rejected because controllers and Swagger/API clients need boundary-level contracts.

### 4. Frontend Screens Use a State Matrix
- **Decision:** Each user-facing data screen and async button action must be checked against a state matrix: initial, loading, success, empty, validation error, API error, network/offline, retrying, disabled/submitting, and crash containment.
- **Rationale:** This directly targets non-responding buttons, blank screens, weak feedback, and user trust during failures.
- **Alternative considered:** Only fix screens with currently visible bugs. Rejected because role-based apps often hide failures until a specific account state triggers them.

### 5. Payments Use a Small Adapter Boundary
- **Decision:** Payment start/verify/cancel/fail handling should be centralized behind a reusable frontend payment adapter that chooses native Razorpay in production and WebView only in dev/Expo Go.
- **Rationale:** Checkout screens should not duplicate provider-specific success/failure handling or accidentally ship WebView payment paths to production.
- **Alternative considered:** Keep payment logic inline in screens. Rejected because inline payment logic makes retry, cancel, verification, and telemetry inconsistent.

### 6. Database Review Prioritizes Integrity Before Micro-Optimization
- **Decision:** Review unique constraints, idempotency keys, payment/order transaction boundaries, foreign keys, index duplication, and high-cardinality query paths before cosmetic model cleanup.
- **Rationale:** Order/payment correctness and data consistency matter more than small query improvements.
- **Alternative considered:** Only inspect slow queries. Rejected because missing constraints and duplicate writes can create irreversible business data issues even when queries are fast.

### 7. Production Readiness Includes Server Edges
- **Decision:** Audit environment variables, secrets, API base URL selection, CORS, Nginx proxy headers, TLS assumptions, logging, process health, and release build checks together.
- **Rationale:** Expo apps and Node APIs often pass local testing while failing in production due to localhost URLs, native module differences, or proxy/header mismatches.
- **Alternative considered:** Limit audit to application code. Rejected because the user explicitly included Ubuntu and Nginx.

## Risks / Trade-offs

- **[Risk] Full file-by-file audit can become too broad to implement at once** -> Mitigation: classify findings as P0/P1/P2/P3 and implement production blockers first.
- **[Risk] Native Razorpay behavior cannot be fully verified in Expo Go** -> Mitigation: require dev-client or production-like Android/iOS builds for native SDK checks and keep WebView only behind dev guards.
- **[Risk] DB index or constraint changes can lock tables or affect production writes** -> Mitigation: require backup, staging run, explain-plan review, and rollback SQL before applying to production.
- **[Risk] UI polish can drift into redesign** -> Mitigation: reuse existing theme, components, and role layouts; focus on state completeness and responsive consistency.
- **[Risk] Security findings may expose committed secrets** -> Mitigation: document file paths and remediation steps without repeating secret values in audit output.

## Migration Plan

1. Run the audit in read-only mode first: inventory files, route trees, screens, stores, models, scripts, config, and deployment assumptions.
2. Produce the audit register with severity, exact fixes, and verification steps.
3. Apply P0/P1 fixes in this order: secrets/config, payment production behavior, auth/authorization, validation/error contracts, DB integrity, non-responding critical actions, and deployment URL/proxy issues.
4. Apply P2/P3 maintainability fixes: component decomposition, shared hooks, duplicate logic removal, design consistency, test coverage, docs.
5. Verify with backend lint/startup/API scenario checks, frontend type/lint/build checks, payment tests in dev and native builds, MySQL query/constraint checks, and Nginx/API URL smoke checks.
6. Roll back by reverting code changes and, for DB changes, running reviewed rollback SQL created before migration.

## Open Questions

- Which production domains and Nginx server blocks should be treated as canonical for API and app configuration?
- Which Razorpay mode should staging use: test keys with native SDK, or a separate sandbox-like environment?
- Are there existing production logs or crash reports to prioritize the audit findings by real user impact?
