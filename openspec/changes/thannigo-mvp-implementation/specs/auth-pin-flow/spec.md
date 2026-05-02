## ADDED Requirements

### Requirement: App launch JWT session check
On launch, the system SHALL check for a valid local JWT access token. If valid, the user SHALL be auto-routed to their role dashboard. If the access token is expired but a valid refresh token exists, the system SHALL silently refresh and route. If neither token is valid, the Phone Number screen SHALL be shown.

#### Scenario: Valid access token on launch
- **WHEN** the app launches and a non-expired JWT access token exists in secure storage
- **THEN** the system SHALL skip authentication screens and route the user directly to their role-specific dashboard

#### Scenario: Expired access token with valid refresh token
- **WHEN** the app launches and the access token is expired but the refresh token is valid
- **THEN** the system SHALL silently call the token refresh endpoint and route the user to their dashboard without showing any auth screen

#### Scenario: Both tokens expired or absent
- **WHEN** the app launches and no valid access or refresh token exists
- **THEN** the system SHALL display the Phone Number entry screen

#### Scenario: Token refresh fails due to network error
- **WHEN** the token refresh request fails due to a network error
- **THEN** the system SHALL log AUTH0001, show a "Connection error. Please try again." message with a Retry button

#### Scenario: Token refresh fails due to invalid token
- **WHEN** the refresh token is rejected by the server
- **THEN** the system SHALL log AUTH0002, clear stored tokens, and redirect to the Phone Number screen with message "Session expired. Please log in again."

### Requirement: Force update gate on app launch
The system SHALL block all interaction and display a force-update prompt when the installed app version is below the minimum required version configured on the backend.

#### Scenario: App version below minimum
- **WHEN** the app launches and the server returns a minimum version greater than the installed version
- **THEN** the system SHALL log SYS0001 and show a full-screen force-update prompt with a store link; no other interaction is permitted

#### Scenario: App version meets minimum
- **WHEN** the installed app version meets or exceeds the minimum required version
- **THEN** the system SHALL proceed normally with session check

### Requirement: Phone number entry and role detection
The system SHALL accept a 10-digit Indian mobile number (+91 fixed) and determine whether the user is new or existing. Existing users are routed to PIN Entry. New users are routed to Role Selection.

#### Scenario: Valid existing user phone number
- **WHEN** a user submits a 10-digit number starting with 6–9 that is already registered
- **THEN** the system SHALL navigate to the PIN Entry screen

#### Scenario: Valid new user phone number
- **WHEN** a user submits a 10-digit number starting with 6–9 that is not registered
- **THEN** the system SHALL navigate to the Role Selection screen

#### Scenario: Phone number fewer than 10 digits
- **WHEN** the user submits a number with fewer than 10 digits
- **THEN** the system SHALL log AUTH0003 and display "Enter a valid 10-digit mobile number." (client-side, no server call)

#### Scenario: Phone number starts with 0–5
- **WHEN** the user submits a 10-digit number starting with 0 through 5
- **THEN** the system SHALL log AUTH0004 and display "Enter a valid Indian mobile number." (client-side)

#### Scenario: Empty phone input submitted
- **WHEN** the user submits without entering a number
- **THEN** the system SHALL log AUTH0007 and display "Please enter your mobile number."

#### Scenario: Rate limit exceeded on phone check
- **WHEN** the server returns a rate-limit response for the phone check endpoint
- **THEN** the system SHALL log AUTH0006 and display "Too many attempts. Try after 10 minutes."

### Requirement: PIN entry with attempt tracking and lockout
The system SHALL allow up to 3 wrong PIN attempts before locking the account. Each wrong attempt SHALL decrement a visible attempt counter. On lockout, the Forgot PIN flow is mandatory.

#### Scenario: Correct PIN entered
- **WHEN** an existing user submits the correct 4-digit PIN
- **THEN** the system SHALL issue JWT access and refresh tokens and route the user to their role dashboard

#### Scenario: Wrong PIN — first attempt
- **WHEN** the user submits an incorrect PIN with 2 attempts remaining
- **THEN** the system SHALL log AUTH0008 and display "Incorrect PIN. 2 attempts remaining."

#### Scenario: Wrong PIN — second attempt
- **WHEN** the user submits an incorrect PIN with 1 attempt remaining
- **THEN** the system SHALL log AUTH0009 and display "Incorrect PIN. 1 attempt remaining."

#### Scenario: Wrong PIN — third attempt triggers lockout
- **WHEN** the user submits an incorrect PIN as their third attempt
- **THEN** the system SHALL log AUTH0010, flag the PIN as locked in the database, and display "PIN locked. Please reset via OTP." The Forgot PIN link SHALL be highlighted.

#### Scenario: PIN screen loaded while account is locked
- **WHEN** a user navigates to the PIN Entry screen and their PIN is already locked
- **THEN** the system SHALL log AUTH0011 and display "Your PIN is locked. Tap Forgot PIN to reset." No further PIN entry is allowed.

#### Scenario: Non-numeric PIN input
- **WHEN** a user enters non-numeric characters in the PIN field
- **THEN** the system SHALL log AUTH0013 and display "PIN must be numeric." (client-side)

### Requirement: Forgot PIN OTP flow with dual-channel delivery
The system SHALL send a 6-digit OTP to the user's registered email via Brevo. If Brevo does not confirm delivery within 30 seconds, the system SHALL send an SMS OTP via MSG91 as fallback.

#### Scenario: OTP sent via Brevo email successfully
- **WHEN** a user taps Forgot PIN and Brevo confirms email delivery within 30 seconds
- **THEN** the system SHALL display an OTP input screen and wait up to 5 minutes for entry

#### Scenario: OTP sent via MSG91 SMS fallback
- **WHEN** a user taps Forgot PIN and Brevo does not confirm delivery within 30 seconds
- **THEN** the system SHALL send an SMS OTP via MSG91 and display the OTP input screen

#### Scenario: Both OTP channels fail
- **WHEN** both Brevo and MSG91 fail to deliver the OTP
- **THEN** the system SHALL log AUTH0017 and display "Unable to send OTP. Contact support."

#### Scenario: Wrong OTP entered
- **WHEN** the user submits an incorrect OTP
- **THEN** the system SHALL log AUTH0014 and display "Incorrect OTP. X attempts remaining."

#### Scenario: OTP expired
- **WHEN** the user submits an OTP after its 5-minute validity window
- **THEN** the system SHALL log AUTH0015 and display "OTP has expired. Tap Resend OTP."

#### Scenario: Max OTP attempts exceeded
- **WHEN** the user submits a wrong OTP for the 3rd time
- **THEN** the system SHALL log AUTH0016 and display "Too many attempts. Please wait 10 minutes." A 10-minute cooldown SHALL apply.

#### Scenario: OTP resend requested within 30-second cooldown
- **WHEN** the user taps Resend OTP before 30 seconds have elapsed since the last send
- **THEN** the system SHALL display the remaining cooldown time and not send a new OTP

### Requirement: Set New PIN with strength validation
After successful OTP verification, the user SHALL set a new 4-digit PIN. The new PIN must differ from the old PIN and must not be sequential or repeated.

#### Scenario: Valid new PIN accepted
- **WHEN** the user enters a valid new PIN that is not the same as the old PIN and not sequential or repeated, and confirms it correctly
- **THEN** the system SHALL hash and store the new PIN, reset the lockout counter, auto-login the user, and route them to their role dashboard

#### Scenario: New PIN same as old PIN
- **WHEN** the user enters a new PIN identical to their current PIN
- **THEN** the system SHALL log AUTH0018 and display "New PIN cannot be the same as your current PIN."

#### Scenario: PIN confirmation mismatch
- **WHEN** the Confirm PIN field does not match the New PIN field
- **THEN** the system SHALL log AUTH0019 and display "PINs do not match. Please re-enter."

#### Scenario: Weak PIN pattern — sequential
- **WHEN** the user enters a sequential PIN such as 1234 or 4321
- **THEN** the system SHALL log AUTH0020 and display "Choose a stronger PIN (avoid repeated/sequential digits)."

#### Scenario: Weak PIN pattern — repeated
- **WHEN** the user enters a repeated-digit PIN such as 1111 or 2222
- **THEN** the system SHALL log AUTH0020 and display "Choose a stronger PIN (avoid repeated/sequential digits)."

### Requirement: Role-based routing post-login
After successful login or auto-login, the system SHALL inspect the role encoded in the JWT and route to the appropriate dashboard.

#### Scenario: Customer login
- **WHEN** a user with role `customer` successfully authenticates
- **THEN** the system SHALL route to the Customer Home screen

#### Scenario: Shop owner login
- **WHEN** a user with role `shop_owner` successfully authenticates
- **THEN** the system SHALL route to the Shop Owner Dashboard

#### Scenario: Delivery person login
- **WHEN** a user with role `delivery_person` successfully authenticates
- **THEN** the system SHALL route to the Delivery Dashboard

#### Scenario: Admin login
- **WHEN** a user with role `admin` successfully authenticates
- **THEN** the system SHALL route to the Admin Dashboard

#### Scenario: Non-admin phone attempts admin login
- **WHEN** a phone number not flagged as admin role reaches what would be the admin dashboard
- **THEN** the system SHALL log ADMIN0005 and display "Access denied. Admin role not found for this number."
