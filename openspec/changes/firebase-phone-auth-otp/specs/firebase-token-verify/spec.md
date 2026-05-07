## ADDED Requirements

### Requirement: Firebase ID Token verification endpoint
The backend SHALL expose `POST /api/v1/auth/verify-firebase-token` (public, rate-limited at 30 req/15 min per IP) that accepts a Firebase ID Token, verifies it using the Firebase Admin SDK, and issues Thannigo JWT + refresh token. The endpoint SHALL NOT accept a phone number in the request body — the phone is extracted exclusively from the verified token to prevent spoofing.

#### Scenario: Valid Firebase ID Token — existing user
- **WHEN** the backend receives a valid, non-expired Firebase ID Token for a phone number that exists in the `users` table
- **THEN** the system SHALL verify the token via `admin.auth().verifyIdToken()`, find the user by `phone`, issue a Thannigo access token and refresh token, and return the same response shape as `POST /auth/verify-otp`

#### Scenario: Valid Firebase ID Token — new user
- **WHEN** the backend receives a valid Firebase ID Token for a phone number not in the `users` table
- **THEN** the system SHALL create a new user record (`role: "guest"`, `status: "active"`), issue tokens, and return `is_new_user: true` with `next_step: { step_key: "select-role", screen_route: "/auth/role" }`

#### Scenario: Expired Firebase ID Token
- **WHEN** the Firebase ID Token's `exp` claim is in the past
- **THEN** the system SHALL return `401` with code `FIREBASE_TOKEN_EXPIRED` and message "Firebase token has expired. Please re-authenticate."

#### Scenario: Invalid or tampered Firebase ID Token
- **WHEN** the token signature is invalid or the token was issued for a different Firebase project
- **THEN** the system SHALL return `401` with code `FIREBASE_TOKEN_INVALID` and message "Invalid authentication token."

#### Scenario: Firebase Admin SDK unavailable (network error)
- **WHEN** `admin.auth().verifyIdToken()` throws a network error reaching Firebase servers
- **THEN** the system SHALL log the error with full stack trace, return `503` with code `FIREBASE_UNAVAILABLE` and message "Authentication service temporarily unavailable. Please try again."

#### Scenario: Suspended user account
- **WHEN** the Firebase token is valid but the matched Thannigo user has `status: "suspended"`
- **THEN** the system SHALL return `403` with code `ACCOUNT_SUSPENDED` — identical to the existing `/verify-otp` suspended check

---

### Requirement: Phone number extraction from Firebase token
The backend SHALL extract the verified phone number exclusively from `decodedToken.phone_number` (the Firebase-verified field). Any `phone` field sent in the request body SHALL be ignored during user resolution.

#### Scenario: Token contains verified phone number
- **WHEN** `decodedToken.phone_number` is present in the verified token payload
- **THEN** the system SHALL use this value (format: `+91XXXXXXXXXX`) to query the `users` table via `User.findOrCreate({ where: { phone: decodedToken.phone_number } })`

#### Scenario: Token missing phone number claim
- **WHEN** `decodedToken.phone_number` is absent (e.g. token from email-auth Firebase user)
- **THEN** the system SHALL return `400` with code `FIREBASE_PHONE_MISSING` and message "Phone number not present in token."

---

### Requirement: Referral code handling for Firebase new user signup
New users created via the Firebase token verification path SHALL support the same referral code flow as the existing `/verify-otp` path.

#### Scenario: New user with referral code
- **WHEN** the request body contains a valid `referral_code` and the Firebase user is new
- **THEN** the system SHALL call `ReferralService.handleSignup(user.id, referral_code)` after user creation

#### Scenario: New user without referral code
- **WHEN** no `referral_code` is present in the request body
- **THEN** the system SHALL skip referral handling and proceed normally

---

### Requirement: Onboarding next-step resolution for Firebase-verified users
The backend SHALL resolve and return `next_step` for Firebase-verified users using the same `OnboardingService` logic as the existing `/verify-otp` endpoint.

#### Scenario: New guest user — needs role selection
- **WHEN** a new user is created via Firebase verification with `role: "guest"`
- **THEN** `next_step` SHALL be `{ step_key: "select-role", screen_route: "/auth/role", title: "Choose your role" }`

#### Scenario: Existing user with incomplete onboarding
- **WHEN** an existing user has `onboarding_completed: false`
- **THEN** `next_step` SHALL be resolved by `OnboardingService.getUserNextStep` or `OnboardingService.getShopNextStep` based on role

#### Scenario: Existing user with completed onboarding
- **WHEN** an existing user has `onboarding_completed: true`
- **THEN** `next_step` SHALL be `null`
