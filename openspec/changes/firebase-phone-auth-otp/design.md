## Context

Thannigo currently uses MSG91 for all SMS OTP delivery. This has caused repeated production incidents: IP whitelist mismatches, DLT template delays, error 418s, and a 30-second blocking fallback sleep that times out mobile clients. Firebase Phone Authentication removes all of this operational surface from Thannigo's ownership — Google's infra handles OTP routing, delivery, and retry globally.

The Firebase Admin SDK is already initialised in the backend (`firebase-admin` in package.json, service account credentials in `.env`). The frontend already has `@react-native-firebase/app` as a peer. This means the integration surface is narrow: a new frontend OTP module and a new backend token-verification endpoint.

MSG91 is retained as the fallback. The fallback fires when Firebase SDK initialisation fails, when the user is on iOS without a SIM, or on explicit error from Firebase — preserving continuity during Firebase outages.

## Goals / Non-Goals

**Goals:**
- Firebase Phone Auth is the default OTP path for all new login/register flows
- Android users get automatic OTP read (SMS Retriever API) via Firebase — zero manual copy-paste
- Backend verifies Firebase ID Tokens server-side; Thannigo remains the authority for JWT issuance
- MSG91 continues to work as a fallback with no behaviour change
- No breaking changes to existing PIN login, biometric login, or refresh/logout flows

**Non-Goals:**
- Replacing PIN login — OTP is only for first login / forgot-PIN / new device flows
- Removing MSG91 — it is preserved and remains functional
- Firebase as the user database — Thannigo's own MySQL `users` table remains authoritative
- Phone number ownership by Firebase — Thannigo does not transfer account management to Firebase

## Decisions

### Decision 1: Frontend-driven Firebase verification, backend only validates the ID Token

Firebase Phone Auth is initiated entirely on the device. The frontend calls `firebase.auth().verifyPhoneNumber(phone)`, receives a verification ID, collects the OTP (auto or manual), calls `firebase.auth().signInWithCredential(PhoneAuthProvider.credential(verificationId, otp))`, and receives a Firebase ID Token. That token is sent to the backend.

**Why this over backend-initiated Firebase Auth Admin SDK OTP?**
Firebase does not expose a server-side OTP send API via Admin SDK — it's frontend-SDK-only. The Admin SDK only verifies tokens that the frontend already produced. This is the canonical Firebase Phone Auth architecture.

### Decision 2: New endpoint `POST /api/v1/auth/verify-firebase-token` — does not replace `/verify-otp`

A new endpoint accepts `{ firebase_id_token, device_id, referral_code }`. It calls `admin.auth().verifyIdToken(token)`, extracts the phone number, then runs the same user-resolution and JWT-issuance logic as `verifyOtp`. The old `/verify-otp` endpoint stays live for MSG91 fallback.

**Why not reuse `/verify-otp`?**
The two flows use a fundamentally different verification mechanism (Firebase token vs bcrypt OTP hash). Merging them into one endpoint with a conditional would make the controller hard to audit. Two clean endpoints, one per trust chain.

### Decision 3: Fallback priority — Firebase fails → MSG91

The frontend `authApi` tries Firebase first. If `firebase.auth().verifyPhoneNumber()` throws (network error, Firebase quota, iOS SIM-less), it catches the error, logs it, and falls back to calling the existing `/auth/send-otp` (MSG91) + `/auth/verify-otp` path. The OTP entry UI is identical from the user's perspective.

**Why not try MSG91 first?**
MSG91 has the documented operational problems that motivated this change. Firebase is the reliable path; MSG91 is the escape hatch.

### Decision 4: Firebase ID Token verified with 1-hour clock tolerance

`admin.auth().verifyIdToken(idToken, { checkRevoked: false })` is used. Token revocation checking is skipped because it requires an extra network round-trip to Firebase and the token is fresh (just issued on login). Clock skew tolerance is the Firebase SDK default (5 minutes).

### Decision 5: Phone number extracted from Firebase token, not from request body

The verified phone from `decodedToken.phone_number` is used to find/create the Thannigo user — not a `phone` field in the request body. This prevents phone number spoofing: a user cannot claim a different number by sending a valid token plus a tampered body.

## Risks / Trade-offs

**[Risk] Firebase quota limits on free tier** → Free tier allows 10,000 SMS/month (India). Thannigo's current scale is well within this. Monitor monthly active OTP requests; upgrade Firebase plan before hitting 80% of quota.

**[Risk] Firebase Phone Auth not available in some regions or on emulators** → Fallback to MSG91 handles this. Emulator testing uses `FIREBASE_APP_CHECK_DEBUG_TOKEN` and the Firebase Local Emulator Suite.

**[Risk] Firebase token replay** → Firebase ID Tokens expire in 1 hour and are single-use from the auth perspective (the user's Firebase session is created on sign-in). The backend does not need to cache seen tokens because Thannigo's refresh token system is the session — the Firebase ID Token is only used once to bootstrap the Thannigo session.

**[Risk] User has existing MSG91-verified account; Firebase phone differs** → Firebase always verifies the actual SIM. If the phone matches, `User.findOrCreate` resolves correctly. No conflict.

**[Trade-off] Firebase requires `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)** → Both already exist in the repo (`frontend/google-services.json`, `frontend/GoogleService-Info.plist`). No new config files needed.

## Migration Plan

1. Add `@react-native-firebase/auth` to frontend (`npm install`)
2. Implement `FirebaseOtpService` and new `authApi.verifyFirebaseToken` — no removal of old paths yet
3. Implement `POST /api/v1/auth/verify-firebase-token` on backend
4. Feature-flag via a constant `FIREBASE_AUTH_ENABLED = true` in frontend config — flip to `false` to revert to MSG91-only instantly
5. Test on Android (auto-read) and iOS (manual entry) with real SIMs in staging
6. Deploy backend first, then frontend — backend is additive (new endpoint only)
7. **Rollback**: Set `FIREBASE_AUTH_ENABLED = false` — falls back to MSG91. No DB migration needed.

## Open Questions

- Should Firebase auth also cover the `reset_pin` OTP flow, or only `login`/`register`/`new_device`? (Recommend: yes, same path)
- When Firebase quota is exceeded, should the backend detect it and auto-switch, or rely on frontend fallback? (Current design: frontend fallback is sufficient)
