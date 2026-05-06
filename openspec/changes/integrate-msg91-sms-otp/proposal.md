## Why

The existing OTP authentication flow lacks a concrete SMS delivery implementation — MSG91 is referenced in the notification-system spec as the designated SMS provider for OTP fallback, but no integration exists. This change wires MSG91 into the current backend so OTP messages can be delivered via SMS without touching any business logic.

## What Changes

- Add `msg91.service.js` — a self-contained SMS provider module with `sendOTP(mobile, otp)` and `verifyOTP(mobile, otp)` methods
- Read MSG91 credentials (`MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`, `MSG91_SENDER_ID`) from `.env`
- Use Axios for all outbound MSG91 API calls with async/await and structured error handling
- Enforce `91XXXXXXXXXX` mobile format for all outbound calls
- Return standardised JSON responses from both methods
- Emit structured logs for OTP sent, OTP send failure, and verification failure events
- Drop-in replacement for the current SMS provider — no changes to OTP generation, expiry, resend, or rate-limiting logic

## Capabilities

### New Capabilities
- `msg91-sms-provider`: SMS delivery adapter for OTP that wraps the MSG91 API, providing `sendOTP` and `verifyOTP` as the sole public interface consumed by the auth service

### Modified Capabilities
<!-- No spec-level requirement changes — this implements the existing notification-system spec's MSG91 OTP fallback requirement -->

## Impact

- **New file**: `src/services/msg91.service.js` (or equivalent path matching project structure)
- **Auth/OTP service**: replace SMS provider call site with `msg91Service.sendOTP` / `msg91Service.verifyOTP`
- **Dependencies**: `axios` (assumed already present; add if missing)
- **Environment**: `.env` must include `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`, `MSG91_SENDER_ID`
- **No impact** on OTP generation, verification logic, expiry, resend throttle, or rate limiting
