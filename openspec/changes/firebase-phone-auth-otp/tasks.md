## 1. Dependencies & Environment

- [x] 1.1 Add `@react-native-firebase/auth` to `frontend/package.json` (peer of existing `@react-native-firebase/app@^24.0.0`) and run `npm install` inside `frontend/`
- [x] 1.2 Verify `google-services.json` has `"phone"` in the `oauth_client` or `services` block; confirm Firebase console has Phone Authentication provider enabled for project `thanigo-7c13b`
- [x] 1.3 Add `FIREBASE_AUTH_ENABLED=true` constant to `frontend/constants/config.ts` (or equivalent config file) so the feature can be toggled off in one place without a deploy

## 2. Backend — Firebase Token Verify Endpoint

- [x] 2.1 Create `backend/src/controllers/auth/firebaseAuth.controller.js` — export `verifyFirebaseToken` handler: call `admin.auth().verifyIdToken(idToken)`, extract `decodedToken.phone_number`, return `400 FIREBASE_PHONE_MISSING` if absent
- [x] 2.2 In `verifyFirebaseToken`: run `User.findOrCreate({ where: { phone: decodedToken.phone_number }, defaults: { role: "guest", status: "active", ... } })` — reuse the same defaults as `verifyOtp`
- [x] 2.3 In `verifyFirebaseToken`: issue Thannigo `accessToken` + `rawRefreshToken` via `AuthService.generateAccessToken` / `AuthService.storeRefreshToken` — identical to `verifyOtp` token issuance block
- [x] 2.4 In `verifyFirebaseToken`: resolve `next_step` via `OnboardingService` and `referral_code` via `ReferralService.handleSignup` — same logic as `verifyOtp`
- [x] 2.5 In `verifyFirebaseToken`: handle suspended user (`403 ACCOUNT_SUSPENDED`), delivery-person inactive (`403 DRIVER_INACTIVE`), expired token (`401 FIREBASE_TOKEN_EXPIRED`), invalid token (`401 FIREBASE_TOKEN_INVALID`), Firebase Admin SDK network error (`503 FIREBASE_UNAVAILABLE`)
- [x] 2.6 Add `POST /api/v1/auth/verify-firebase-token` route in `backend/src/routes/v1/auth/auth.routes.js` with the same `otpLimiter` (30 req / 15 min per IP) applied — no `authenticateToken` middleware (public endpoint)
- [x] 2.7 Fix the rate-limiter path bug in `backend/src/config/middleware.js`: change `app.use("/api/auth/send-otp", otpLimiter)` and `app.use("/api/auth/verify-otp", otpLimiter)` to `/api/v1/auth/send-otp` and `/api/v1/auth/verify-otp` so the middleware-level limiters actually fire

## 3. Backend — MSG91 Fixes (prerequisite for reliable fallback)

- [x] 3.1 In `backend/src/utils/SmsService.js`: add `sender: SENDER_ID` to the MSG91 Flow API payload (currently missing — required field)
- [x] 3.2 In `SmsService.js`: change `short_url: "0"` to `short_url: 0` (integer, not string)
- [x] 3.3 In `SmsService.js`: expand error logging to include the full MSG91 response body, HTTP status code, and error code — not just `data.message`
- [x] 3.4 In `SmsService.js`: move `authkey` from query params to request header in the `verifyOTP` call (currently leaks auth key into URL/access logs)
- [x] 3.5 In `SmsService.js`: add retry logic (2 retries, 500ms / 1000ms delay) for transient network errors only — do not retry on 418 or other MSG91 rejection codes
- [x] 3.6 In `backend/src/controllers/auth/auth.controller.js`: remove the `await sleep(30_000)` call (line ~139) — it holds the HTTP connection for 30 seconds and causes mobile client timeouts when email fallback fails
- [ ] 3.7 Whitelist the server IPv4 `204.168.233.179` in the MSG91 dashboard (IP Whitelisting section) — only IPv6 `2a01:4f9:c014:5ac4::1` is currently whitelisted; Node.js may connect via either

## 4. Frontend — FirebaseOtpService

- [x] 4.1 Create `frontend/services/firebaseOtpService.ts` — import `auth` from `@react-native-firebase/auth`; export `sendOtp(phone: string): Promise<{ success: boolean; verificationId?: string; error?: string }>` that calls `auth().verifyPhoneNumber(phone)` and returns the verificationId
- [x] 4.2 In `FirebaseOtpService.sendOtp`: catch all Firebase errors, log `FIREBASE_SEND_FAILED` with `error.code`, and return `{ success: false, error: error.code }` — never throw
- [x] 4.3 Add `verifyOtp(verificationId: string, otp: string): Promise<{ success: boolean; idToken?: string; error?: string }>` to `FirebaseOtpService`: create `PhoneAuthProvider.credential(verificationId, otp)`, call `auth().signInWithCredential(credential)`, then `user.getIdToken()` — return `{ success: true, idToken }` on success
- [x] 4.4 In `FirebaseOtpService.verifyOtp`: handle `auth/invalid-verification-code` → `{ success: false, error: "INVALID_CODE" }`, `auth/session-expired` → `{ success: false, error: "SESSION_EXPIRED" }`, all others → `{ success: false, error: error.code }`

## 5. Frontend — authApi Integration

- [x] 5.1 Add `verifyFirebaseToken(idToken: string, opts?: { device_id?: string; referral_code?: string })` to `frontend/api/authApi.ts` — POST to `/api/v1/auth/verify-firebase-token` with `{ firebase_id_token: idToken, ...opts }`
- [x] 5.2 In `authApi.ts` (or the calling store/hook): add `sendOtpWithFallback(phone: string)` that tries `FirebaseOtpService.sendOtp` first; on failure calls `authApi.sendOtp(phone)` — returns `{ channel: "firebase" | "msg91", verificationId?: string }`
- [x] 5.3 Persist the active `channel` and `verificationId` in the OTP screen component state (or Zustand auth store) so the verify step knows which path to use

## 6. Frontend — OTP Screen Updates

- [x] 6.1 Update `frontend/app/auth/otp.tsx`: on mount, call `sendOtpWithFallback` and store `{ channel, verificationId }` in state
- [x] 6.2 In the OTP submit handler: if `channel === "firebase"`, call `FirebaseOtpService.verifyOtp(verificationId, enteredOtp)` then `authApi.verifyFirebaseToken(idToken)`; if `channel === "msg91"`, call existing `authApi.verifyOtp(phone, otp)` — keep both branches clean
- [x] 6.3 Add auto-fill listener for Android SMS Retrieval: inside `FirebaseOtpService.sendOtp`, set up `auth().onAuthStateChanged` or use `PhoneAuthProvider` `onCodeAutoRetrievalTimeOut` and `onVerificationCompleted` callbacks — on `onVerificationCompleted`, auto-submit the credential without manual OTP entry
- [x] 6.4 Update Resend button logic: call `sendOtpWithFallback` again on tap (same channel preference); reset the 60-second cooldown timer
- [x] 6.5 Show correct error messages per Firebase error code: `INVALID_CODE` → "Incorrect code. Please try again.", `SESSION_EXPIRED` → "Code expired. Tap Resend.", fallback error → "Verification failed. Try again."

## 7. Testing

- [ ] 7.1 Test Firebase OTP send + auto-read on a physical Android device with a real Indian SIM — confirm OTP pre-fills and login completes without manual entry
- [ ] 7.2 Test Firebase OTP send + manual entry on a physical iOS device — confirm OTP entry screen works and `verify-firebase-token` issues valid JWT
- [ ] 7.3 Test Firebase fallback: temporarily disable Firebase Phone Auth in Firebase console → confirm MSG91 path fires automatically and user can still log in
- [ ] 7.4 Test `POST /api/v1/auth/verify-firebase-token` with an expired token → confirm `401 FIREBASE_TOKEN_EXPIRED`
- [ ] 7.5 Test `POST /api/v1/auth/verify-firebase-token` with a tampered token → confirm `401 FIREBASE_TOKEN_INVALID`
- [ ] 7.6 Test MSG91 smoke test with fixed payload: `ENVIRONMENT=production MOBILE=91XXXXXXXXXX node scripts/smoke-test-sms.js --test 5.1` — confirm OTP SMS received after adding `sender` field and whitelisting IPv4
- [ ] 7.7 Confirm rate limiter now fires correctly on `/api/v1/auth/verify-firebase-token` and `/api/v1/auth/send-otp` after the middleware path fix
