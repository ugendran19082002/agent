## ADDED Requirements

### Requirement: Environment Configuration Safety
Production builds and servers SHALL use environment-specific configuration for API URLs, Razorpay keys, Firebase keys, database credentials, Redis, CORS origins, and feature flags without relying on localhost or committed secrets.

#### Scenario: Production app starts
- **WHEN** the production mobile app initializes API and payment configuration
- **THEN** it uses the production API base URL and production-safe public keys, and no localhost URL is active

#### Scenario: Secret file is found
- **WHEN** the audit finds credentials or private service account files committed or referenced unsafely
- **THEN** the audit records the affected file path and requires moving the secret to secure environment storage with rotation guidance

### Requirement: Ubuntu And Nginx Readiness
The deployment audit SHALL verify the Node API can run behind Ubuntu and Nginx with correct proxy headers, TLS expectations, request body limits, static/upload handling, health checks, logging, and process restart behavior.

#### Scenario: API request passes through Nginx
- **WHEN** a client request reaches the API through Nginx
- **THEN** the backend receives correct host, protocol, client IP, body size, CORS, and timeout behavior

#### Scenario: Backend process restarts
- **WHEN** the Node process crashes or the server restarts
- **THEN** the configured process manager restores the API and logs enough context to diagnose the outage

### Requirement: Release Verification Checklist
The production readiness audit SHALL define verification commands and manual checks for backend startup, frontend lint/type/build readiness, payment environment behavior, database connectivity, Nginx proxy behavior, and smoke flows.

#### Scenario: Release candidate is checked
- **WHEN** a release candidate is prepared
- **THEN** the checklist verifies login, API health, order creation, native payment start, payment verification, offline handling, and role navigation before release

#### Scenario: Verification fails
- **WHEN** any release check fails
- **THEN** the release is blocked with a specific failing file, command, scenario, and required fix
