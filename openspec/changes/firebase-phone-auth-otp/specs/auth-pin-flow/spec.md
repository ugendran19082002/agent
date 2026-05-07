## MODIFIED Requirements

### Requirement: OTP delivery for login, registration, and PIN reset
The system SHALL attempt OTP delivery via Firebase Phone Authentication as the primary channel. If Firebase is unavailable or fails, the system SHALL automatically fall back to MSG91 SMS without user intervention. The OTP entry UI is identical regardless of which channel was used. The verification step SHALL match the channel used for delivery: Firebase credential verification for Firebase-sent OTPs, and Thannigo `/auth/verify-otp` (bcrypt hash) for MSG91-sent OTPs.

#### Scenario: OTP sent via Firebase (primary path)
- **WHEN** Firebase Phone Auth is available and the user requests an OTP
- **THEN** the system SHALL call `FirebaseOtpService.sendOtp(phone)`, receive a `verificationId`, and transition to the OTP entry screen

#### Scenario: OTP sent via MSG91 (fallback path)
- **WHEN** Firebase Phone Auth is unavailable or `sendOtp` throws
- **THEN** the system SHALL call `POST /api/v1/auth/send-otp` (MSG91 path) and transition to the OTP entry screen — the user sees no indication of which channel was used

#### Scenario: OTP verification via Firebase path
- **WHEN** the OTP was sent via Firebase and the user submits the 6-digit code
- **THEN** the system SHALL call `FirebaseOtpService.verifyOtp(verificationId, otp)`, obtain a Firebase ID Token, and call `POST /api/v1/auth/verify-firebase-token` to complete login

#### Scenario: OTP verification via MSG91 path
- **WHEN** the OTP was sent via MSG91 fallback and the user submits the 6-digit code
- **THEN** the system SHALL call `POST /api/v1/auth/verify-otp` with `{ phone, otp }` — existing flow unchanged

#### Scenario: Rate limit exceeded (applies to both channels)
- **WHEN** the server returns `429 OTP_COOLDOWN` (MSG91 path) or Firebase returns `auth/too-many-requests`
- **THEN** the system SHALL display "Please wait before requesting another OTP." and disable the Send button until the cooldown expires
