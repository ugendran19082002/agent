## Why

MSG91 SMS OTP delivery has proven unreliable in production due to DLT registration friction, IP whitelist issues, and template approval delays — every incident blocks user login. Firebase Phone Authentication removes all of that infrastructure burden: Google manages OTP delivery globally, Android auto-read (SMS Retriever) is built-in, and there is no DLT registration required on the Thannigo side.

## What Changes

- **New**: Firebase Phone Auth becomes the primary OTP channel on the frontend (React Native via `@react-native-firebase/auth`)
- **New**: Backend gains a `/auth/verify-firebase-token` endpoint that accepts a Firebase ID Token, verifies it server-side using the Firebase Admin SDK (already initialised), and issues Thannigo JWT + refresh token
- **New**: `FirebaseOtpService` on the frontend wraps `firebase.auth().verifyPhoneNumber()` with auto-SMS-retrieval (Android) and fallback manual-entry (iOS)
- **Modified**: Frontend `authApi.sendOtp` and `authApi.verifyOtp` calls are routed through Firebase first; MSG91 path is used as fallback if Firebase verification fails or is unavailable
- **Kept**: MSG91 `sendOTP` / `SmsService` fully retained as the fallback path — no removal
- **Kept**: All existing PIN login, biometric login, refresh token, and logout flows are unchanged

## Capabilities

### New Capabilities
- `firebase-phone-auth`: Frontend Firebase Phone Auth SDK integration — initiates phone verification, handles auto OTP read on Android, manual entry on iOS, and returns a Firebase ID Token
- `firebase-token-verify`: Backend endpoint (`POST /api/v1/auth/verify-firebase-token`) that verifies a Firebase ID Token using Admin SDK, resolves or creates the Thannigo user, and issues JWT + refresh token — identical session outcome to the existing `/verify-otp` flow

### Modified Capabilities
- `auth-pin-flow`: OTP entry screen gains a Firebase-first path; MSG91 OTP flow is kept as the fallback branch — the spec's OTP delivery requirement is now satisfied by Firebase (primary) or MSG91 (secondary)

## Impact

**Frontend (`/frontend`)**
- New dependency: `@react-native-firebase/auth` (peer of existing `@react-native-firebase/app`)
- New file: `frontend/api/firebaseAuthApi.ts` — Firebase phone verification wrapper
- Modified file: `frontend/api/authApi.ts` — routes OTP flow through Firebase first, falls back to MSG91
- Modified screens: OTP entry screen checks which method was used and calls the matching verify path

**Backend (`/backend`)**
- No new npm dependencies — Firebase Admin SDK already initialised (`firebase-admin` in `package.json`)
- New file: `backend/src/controllers/auth/firebaseAuth.controller.js`
- New route: `POST /api/v1/auth/verify-firebase-token` (public, rate-limited)
- No schema changes — user creation/lookup reuses existing `User.findOrCreate` pattern

**Infra / Config**
- Firebase project `thanigo-7c13b` is already configured (`.env` has `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`)
- No new environment variables required
- MSG91 env vars remain and are still used for fallback
