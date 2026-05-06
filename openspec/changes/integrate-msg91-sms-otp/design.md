## Context

The backend has a complete OTP authentication flow (generation, expiry, resend throttle, rate limiting) but no concrete SMS delivery layer. The notification-system spec designates MSG91 as the SMS provider for OTP. The integration must be a thin adapter — zero changes to business logic, pure provider swap.

Current assumption: a previous SMS provider (or stub) is called from the auth/OTP service at the point where an OTP message must be dispatched. That call site is the only thing this change touches.

## Goals / Non-Goals

**Goals:**
- Deliver a production-ready `msg91.service.js` module with `sendOTP(mobile, otp)` and `verifyOTP(mobile, otp)`
- Load all credentials from environment variables (`MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`, `MSG91_SENDER_ID`)
- Enforce `91XXXXXXXXXX` mobile format before every outbound call
- Return uniform `{ success, message, data? }` JSON from both methods
- Emit structured logs for sent, send-failure, and verify-failure events
- Provide an example showing how the auth controller/service wires the module in

**Non-Goals:**
- Changing OTP generation, expiry, resend counting, or rate-limiting logic
- Modifying any existing database schema or model
- Adding retry queuing, webhooks, or delivery receipts
- Supporting non-OTP SMS events (marketing, order notifications)

## Decisions

### 1. Adapter pattern — isolated service module

`msg91.service.js` exposes only `sendOTP` and `verifyOTP`. It has no knowledge of user sessions, database, or business rules. The auth service owns all state; the SMS module owns only transport.

_Alternative considered_: inline MSG91 calls directly in the auth controller. Rejected — couples transport to business logic and makes provider replacement harder.

### 2. Axios over native `fetch` or `got`

Axios is the de-facto standard in this project stack and is almost certainly already installed. It provides interceptors, timeout configuration, and consistent error objects across Node versions without polyfills.

_Alternative_: native `fetch` (Node 18+). Possible, but adds boilerplate for timeout and consistent error normalisation. Not worth the churn if Axios is already present.

### 3. Local OTP state, MSG91 only for transport

MSG91 offers its own OTP generation and verification API (flow 2). We deliberately do **not** use it. The existing backend owns OTP state (value, expiry, attempt count). MSG91 is used exclusively to deliver the OTP text. `verifyOTP` in `msg91.service.js` calls MSG91's OTP verify endpoint only as an optional transport-level check; the auth service's own DB check remains authoritative.

_Rationale_: avoids splitting OTP state across two systems and keeps the existing rate-limiting and expiry logic intact.

### 4. Mobile format enforcement at service boundary

`91XXXXXXXXXX` format is validated inside `msg91.service.js` before every API call. The caller (auth service) does not need to pre-format.

_Alternative_: validate in controller. Rejected — puts transport concerns in business code.

### 5. Standardised response envelope

Both methods return `{ success: boolean, message: string, data?: object }`. Errors never throw out of the module; they are caught and returned as `{ success: false, message: <reason> }`. Callers check `success` rather than try/catch.

_Rationale_: keeps auth service control flow simple; a single `if (!result.success)` branch handles all failure modes.

## Risks / Trade-offs

- **MSG91 API changes** → Mitigation: pin the API version in the base URL; update only `msg91.service.js` when MSG91 changes their interface.
- **Template ID mismatch** → MSG91 will reject sends if the template body doesn't match. Mitigation: document the required template format in the env example and add a startup check that logs a warning if `MSG91_TEMPLATE_ID` is absent.
- **Mobile format bugs** → If the caller passes an already-prefixed number (e.g. `9191XXXXXXXXXX`), the format check will reject it. Mitigation: normalise inside the service (strip leading `+` or duplicate country code).
- **Axios not installed** → Mitigation: document as a prerequisite; the integration test will fail fast if missing.

## Migration Plan

1. Add `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`, `MSG91_SENDER_ID` to `.env` and `.env.example`
2. Install `axios` if not already present (`npm install axios`)
3. Create `src/services/msg91.service.js`
4. In the auth/OTP service, replace the existing SMS provider call with `msg91Service.sendOTP` / `msg91Service.verifyOTP`
5. Smoke-test with a real mobile number in staging before deploying to production

**Rollback**: revert the single call-site change in the auth service to restore the previous provider. `msg91.service.js` can remain in the codebase without impact.

## Open Questions

- Does the project already have `axios` in `package.json`? (Check before adding as a new dep.)
- What is the exact path convention for services in this project (`src/services/`, `services/`, `app/services/`)? Tasks will use a placeholder — confirm before implementing.
- Is `verifyOTP` at the MSG91 level actually required, or should it be a no-op that delegates entirely to existing DB verification? Defaulting to calling MSG91's verify endpoint; remove if the auth service already handles this completely.
