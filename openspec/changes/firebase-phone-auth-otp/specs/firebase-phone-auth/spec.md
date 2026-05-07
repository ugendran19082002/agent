## ADDED Requirements

### Requirement: Firebase Phone Auth SDK initialisation
The frontend SHALL initialise `@react-native-firebase/auth` at app boot and expose a `FirebaseOtpService` module. If Firebase Auth is unavailable or throws during initialisation, the system SHALL log `FIREBASE_AUTH_UNAVAILABLE` and set an internal flag that forces all OTP requests through the MSG91 fallback path.

#### Scenario: Firebase Auth initialises successfully
- **WHEN** the app boots and `@react-native-firebase/auth` loads without error
- **THEN** the system SHALL set the internal `firebaseReady` flag to `true` and use Firebase as the primary OTP path

#### Scenario: Firebase Auth fails to initialise
- **WHEN** the app boots and `@react-native-firebase/auth` throws during module load
- **THEN** the system SHALL log `FIREBASE_AUTH_UNAVAILABLE`, set `firebaseReady` to `false`, and route all OTP requests through MSG91

---

### Requirement: Firebase phone number verification — send OTP
The system SHALL call `firebase.auth().verifyPhoneNumber(phoneE164)` when the user requests an OTP and `firebaseReady` is `true`. The resulting `verificationId` SHALL be stored in component state for use during verification. On any Firebase error, the system SHALL fall back to the MSG91 `/auth/send-otp` path transparently.

#### Scenario: Firebase OTP sent successfully (Android)
- **WHEN** the user submits a valid `+91XXXXXXXXXX` phone number and Firebase is ready
- **THEN** the system SHALL call `verifyPhoneNumber`, receive a `verificationId`, transition to the OTP entry screen, and begin listening for automatic SMS retrieval

#### Scenario: Firebase OTP sent successfully (iOS)
- **WHEN** the user submits a valid phone number on iOS and Firebase is ready
- **THEN** the system SHALL call `verifyPhoneNumber`, receive a `verificationId`, and transition to the OTP entry screen for manual OTP entry (no auto-read on iOS)

#### Scenario: Firebase quota exceeded or network error
- **WHEN** `verifyPhoneNumber` throws a Firebase error (quota, network, or invalid phone)
- **THEN** the system SHALL log `FIREBASE_SEND_FAILED` with the error code, silently switch to the MSG91 fallback path, and call `POST /api/v1/auth/send-otp` — the user sees a brief loading state but no error message

#### Scenario: MSG91 fallback also fails
- **WHEN** both Firebase `verifyPhoneNumber` and the MSG91 `/auth/send-otp` fallback return errors
- **THEN** the system SHALL display "Could not send OTP. Check your connection and try again." with a Retry button

---

### Requirement: Automatic OTP read on Android (SMS Retriever)
On Android, the system SHALL listen for the SMS auto-retrieval callback from Firebase. When the OTP is automatically read from the incoming SMS, it SHALL be pre-filled in the OTP input field and the verification SHALL proceed without any user tap.

#### Scenario: Auto OTP read succeeds on Android
- **WHEN** the incoming OTP SMS is intercepted by the Firebase SMS Retriever API
- **THEN** the system SHALL pre-fill all 6 OTP digits and automatically call the Firebase credential verification step — the user sees the field fill and a loading spinner with no manual action required

#### Scenario: Auto OTP read times out (30 seconds)
- **WHEN** no SMS is received within the SMS Retriever timeout window (30 seconds)
- **THEN** the system SHALL leave the OTP field empty and active for manual entry — no error is shown; the Resend timer continues normally

---

### Requirement: Manual OTP entry and Firebase credential verification
After receiving the `verificationId` from Firebase, the system SHALL allow manual 6-digit OTP entry. On submission, it SHALL create a `PhoneAuthProvider.credential(verificationId, otp)` and call `firebase.auth().signInWithCredential(credential)`. On success, it SHALL extract the Firebase ID Token and call the Thannigo backend to complete login.

#### Scenario: Correct OTP entered (Firebase path)
- **WHEN** the user enters the correct 6-digit OTP and submits
- **THEN** the system SHALL call `signInWithCredential`, obtain a Firebase ID Token via `firebaseUser.getIdToken()`, and call `POST /api/v1/auth/verify-firebase-token` with the token

#### Scenario: Incorrect OTP entered (Firebase path)
- **WHEN** the user enters an incorrect OTP and Firebase returns `auth/invalid-verification-code`
- **THEN** the system SHALL log `FIREBASE_OTP_INVALID` and display "Incorrect code. Please try again." — the field is cleared; the user can re-enter

#### Scenario: Firebase credential expired (`auth/session-expired`)
- **WHEN** Firebase returns `auth/session-expired` during credential verification
- **THEN** the system SHALL log `FIREBASE_SESSION_EXPIRED` and display "Code expired. Tap Resend to get a new one." with an active Resend button

#### Scenario: Verification request while MSG91 fallback was used
- **WHEN** the OTP was sent via MSG91 fallback (not Firebase)
- **THEN** the system SHALL skip Firebase credential step and call `POST /api/v1/auth/verify-otp` with the OTP as usual — the verification path matches the send path

---

### Requirement: OTP resend with channel continuity
The system SHALL provide a Resend button that becomes active after a 60-second cooldown. Resend SHALL use the same channel (Firebase or MSG91) that was used for the initial send. The resend attempt limit matches the existing MSG91 rate limit (5 per hour per number).

#### Scenario: Resend via Firebase (primary path)
- **WHEN** the user taps Resend and Firebase was the channel for the initial send
- **THEN** the system SHALL call `verifyPhoneNumber` again and reset the auto-read listener

#### Scenario: Resend via MSG91 (fallback path)
- **WHEN** the user taps Resend and MSG91 was the channel for the initial send
- **THEN** the system SHALL call `POST /api/v1/auth/send-otp` again

#### Scenario: Resend while cooldown is active
- **WHEN** the user attempts to resend before the 60-second timer expires
- **THEN** the system SHALL keep the Resend button disabled and show the remaining seconds (e.g. "Resend in 42s")
