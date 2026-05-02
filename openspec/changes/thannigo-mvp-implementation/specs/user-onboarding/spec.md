## ADDED Requirements

### Requirement: Role selection for new users
When a new phone number is detected, the system SHALL present a Role Selection screen with exactly two self-registration options: Customer and Shop Owner. Delivery Person and Admin roles are not available for self-registration.

#### Scenario: New user selects Customer
- **WHEN** a new user taps "I am a Customer" on the Role Selection screen
- **THEN** the system SHALL navigate to the Customer Registration screen (name + PIN fields only)

#### Scenario: New user selects Shop Owner
- **WHEN** a new user taps "I am a Shop Owner" on the Role Selection screen
- **THEN** the system SHALL navigate to Step 1 of the 4-step shop owner onboarding flow

### Requirement: Customer self-registration
The system SHALL register a new customer with only two fields: full name and PIN. On success, the customer is auto-logged in and routed to the Customer Home screen.

#### Scenario: Valid customer registration
- **WHEN** a new user submits a valid name (2–60 chars, letters and spaces only) and matching non-weak PIN
- **THEN** the system SHALL create the customer account, issue JWT tokens, and route to Customer Home screen

#### Scenario: Name too short
- **WHEN** the user submits a name with fewer than 2 characters
- **THEN** the system SHALL log USER0001 and display "Name must be at least 2 characters."

#### Scenario: Name contains numbers or symbols
- **WHEN** the user submits a name containing non-letter, non-space characters
- **THEN** the system SHALL log USER0002 and display "Name can only contain letters and spaces."

#### Scenario: Sequential PIN detected at registration
- **WHEN** the user sets a PIN matching a sequential pattern (1234, 4321, etc.)
- **THEN** the system SHALL log USER0003 and display "Choose a stronger PIN."

#### Scenario: Repeated-digit PIN detected at registration
- **WHEN** the user sets a PIN matching a repeated-digit pattern (1111, 2222, etc.)
- **THEN** the system SHALL log USER0004 and display "Choose a stronger PIN."

#### Scenario: PIN confirmation mismatch at registration
- **WHEN** the Confirm PIN field does not match the New PIN field
- **THEN** the system SHALL log USER0005 and display "PINs do not match."

#### Scenario: Phone number already registered (race condition)
- **WHEN** the backend detects the phone number was registered by another request between phone check and account creation
- **THEN** the system SHALL log USER0006 and display "This number is already registered. Please log in."

### Requirement: Shop owner 4-step onboarding (mobile only, sequential)
The system SHALL enforce completion of all 4 onboarding steps in order. Admin can only Approve or Reject — not edit any step. On full approval, the shop owner is notified and redirected to the post-approval configuration flow.

#### Scenario: All 4 steps completed and submitted
- **WHEN** a shop owner completes all 4 steps and submits
- **THEN** the system SHALL set shop status to "Under Review" and display a Waitlist screen indicating the review state

#### Scenario: Admin rejects a single step
- **WHEN** Admin rejects Step N with a written remark
- **THEN** the system SHALL unlock only Step N for editing; all other approved steps SHALL remain locked

#### Scenario: All steps approved by Admin
- **WHEN** Admin approves all 4 steps for a shop
- **THEN** the system SHALL set shop status to "Approved", notify the shop owner via push + Brevo email, and redirect the owner to post-approval shop settings configuration

### Requirement: Onboarding Step 1 — Basic Details
The system SHALL collect and validate shop and owner information in Step 1.

#### Scenario: Valid Step 1 submitted
- **WHEN** all required fields pass validation and the shop email is unique in the system
- **THEN** the system SHALL save Step 1 data and allow navigation to Step 2

#### Scenario: Shop email already registered
- **WHEN** the submitted shop email already exists in the system
- **THEN** the system SHALL log SHOP0001 and display "This email is already in use."

#### Scenario: Invalid GST format entered
- **WHEN** the user enters a GST number that is not exactly 15 alphanumeric characters
- **THEN** the system SHALL log SHOP0002 and display "Enter a valid 15-character GST number."

#### Scenario: Shop phone matches alternate phone
- **WHEN** the shop phone number and alternate number are identical
- **THEN** the system SHALL log SHOP0003 and display "Alternate number must differ from shop number."

### Requirement: Onboarding Step 2 — Verification Documents
The system SHALL require live photos taken via camera for live shop photo and owner photo. Document uploads are accepted for Aadhaar (front and back) and PAN (JPEG/PNG/PDF, max 5MB each).

#### Scenario: Camera permission denied for live photo
- **WHEN** the user denies camera permission when attempting to take a live photo
- **THEN** the system SHALL log SHOP0006 and display "Camera access is required. Enable in settings."

#### Scenario: Uploaded file exceeds 5MB
- **WHEN** the user attempts to upload a document file larger than 5MB
- **THEN** the system SHALL log SHOP0007 and display "File exceeds 5MB limit. Please use a smaller file."

#### Scenario: Invalid file type uploaded
- **WHEN** the user attempts to upload a file that is not JPEG, PNG, or PDF
- **THEN** the system SHALL log SHOP0008 and display "Only JPEG, PNG, and PDF files are accepted."

#### Scenario: Gallery upload attempted for live photo
- **WHEN** the user attempts to use a gallery image instead of a live camera capture for live shop or owner photo
- **THEN** the system SHALL log SHOP0009 and reject the action, requiring a live camera capture

### Requirement: Onboarding Step 3 — Payment Details
The system SHALL collect bank account details for payout. IFSC code, account number, and optionally UPI ID must pass format validation.

#### Scenario: Invalid IFSC code format
- **WHEN** the user submits an IFSC code that does not match the pattern (4 alpha + 0 + 6 alphanumeric)
- **THEN** the system SHALL log SHOP0011 and display "Enter a valid IFSC code (e.g., HDFC0001234)."

#### Scenario: Non-numeric account number
- **WHEN** the account number field contains non-digit characters
- **THEN** the system SHALL log SHOP0012 and display "Account number must contain digits only."

#### Scenario: Invalid UPI ID format
- **WHEN** a UPI ID is entered and does not match the format xxx@yyy
- **THEN** the system SHALL log SHOP0013 and display "Enter a valid UPI ID (e.g., name@upi)."

### Requirement: Onboarding Step 4 — Live Location via Mapbox GPS
The system SHALL capture the shop's GPS coordinates via device GPS and display them on a Mapbox map. Manual address entry alone is not accepted for this step.

#### Scenario: GPS location captured and confirmed
- **WHEN** the user taps Capture Location, the GPS fix is obtained within accuracy threshold, and the user confirms the pin
- **THEN** the system SHALL save the GPS coordinates as the shop's registered address and allow Step 4 completion

#### Scenario: GPS permission denied
- **WHEN** the user denies location permission
- **THEN** the system SHALL log SHOP0015 and display "Location access is required. Enable in device settings."

#### Scenario: GPS signal unavailable
- **WHEN** the device cannot obtain a GPS fix
- **THEN** the system SHALL log SHOP0016 and display "Unable to get location. Move to an open area and retry."

#### Scenario: GPS accuracy below threshold (accuracy > 50m)
- **WHEN** the obtained GPS fix has accuracy worse than 50 metres
- **THEN** the system SHALL log SHOP0017 and display "Location accuracy is low. Retry for better precision."

#### Scenario: User skips confirmation
- **WHEN** the user attempts to proceed without tapping the location confirmation button
- **THEN** the system SHALL log SHOP0018 and display "Please confirm your shop location before proceeding."

### Requirement: Delivery person account creation by shop owner
Shop owners SHALL create delivery person accounts from the Shop Dashboard. Delivery persons are not self-registered. No SMS is sent — the shop owner communicates the initial PIN manually.

#### Scenario: Shop owner creates delivery person account
- **WHEN** a shop owner submits a delivery person's name, phone number, vehicle type, and initial PIN
- **THEN** the system SHALL create the delivery person account linked to the shop, with `first_login = true`

#### Scenario: Delivery person first login
- **WHEN** a delivery person logs in for the first time (first_login = true)
- **THEN** the system SHALL immediately prompt them to set their own PIN before any other action; the initial shop-owner PIN is replaced

#### Scenario: Shop owner resets delivery person PIN
- **WHEN** a shop owner resets a delivery person's PIN from the dashboard
- **THEN** the system SHALL update the PIN hash and set `first_login = true` so the delivery person is prompted to change it on next login
