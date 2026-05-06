## ADDED Requirements

### Requirement: MSG91 credentials loaded from environment
The module SHALL read `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`, and `MSG91_SENDER_ID` exclusively from environment variables at module initialisation time. If any of the three variables is absent, the module SHALL emit a warning log and subsequent API calls SHALL return `{ success: false, message: "MSG91 configuration missing" }` without making any HTTP request.

#### Scenario: All three env vars present
- **WHEN** the module is loaded and all three env vars are set to non-empty strings
- **THEN** the module SHALL initialise without error and be ready to send/verify OTPs

#### Scenario: One or more env vars missing
- **WHEN** the module is loaded with one or more of the three vars absent or empty
- **THEN** the module SHALL log a warning identifying the missing var(s) and mark itself as unconfigured

#### Scenario: Call made while unconfigured
- **WHEN** `sendOTP` or `verifyOTP` is called on an unconfigured module
- **THEN** the method SHALL return `{ success: false, message: "MSG91 configuration missing" }` without making any HTTP request

---

### Requirement: sendOTP delivers OTP text via MSG91 API
The `sendOTP(mobile, otp)` method SHALL call the MSG91 Send OTP API using Axios with async/await, substituting the provided OTP into the configured template, and return a standardised JSON response.

#### Scenario: Successful OTP send
- **WHEN** `sendOTP` is called with a valid `91XXXXXXXXXX` mobile and a non-empty OTP string
- **THEN** the method SHALL POST to the MSG91 API, log "OTP sent to <mobile>", and return `{ success: true, message: "OTP sent successfully", data: <MSG91 response> }`

#### Scenario: MSG91 API returns error
- **WHEN** the MSG91 API responds with an error status or error body
- **THEN** the method SHALL log "OTP send failed for <mobile>: <error>", and return `{ success: false, message: "Failed to send OTP" }`

#### Scenario: Network or Axios error
- **WHEN** the outbound HTTP call throws (timeout, DNS failure, etc.)
- **THEN** the method SHALL catch the error, log "OTP send failed for <mobile>: <error>", and return `{ success: false, message: "Failed to send OTP" }` without re-throwing

#### Scenario: Invalid mobile format
- **WHEN** `sendOTP` is called with a mobile that does not match `^91[6-9]\d{9}$`
- **THEN** the method SHALL return `{ success: false, message: "Invalid mobile format" }` without making any HTTP request

---

### Requirement: verifyOTP confirms OTP via MSG91 API
The `verifyOTP(mobile, otp)` method SHALL call the MSG91 Verify OTP API using Axios with async/await and return a standardised JSON response. Existing backend OTP state (expiry, attempt counting) remains authoritative; this call is an additional transport-level confirmation.

#### Scenario: OTP verified successfully
- **WHEN** `verifyOTP` is called with a valid mobile and the correct OTP, and MSG91 confirms the match
- **THEN** the method SHALL return `{ success: true, message: "OTP verified successfully", data: <MSG91 response> }`

#### Scenario: OTP verification fails (wrong OTP)
- **WHEN** MSG91 returns a verification failure
- **THEN** the method SHALL log "OTP verification failed for <mobile>: <reason>", and return `{ success: false, message: "OTP verification failed" }`

#### Scenario: Network or Axios error during verification
- **WHEN** the outbound HTTP call throws during verify
- **THEN** the method SHALL catch the error, log "OTP verification failed for <mobile>: <error>", and return `{ success: false, message: "OTP verification failed" }` without re-throwing

#### Scenario: Invalid mobile format on verify
- **WHEN** `verifyOTP` is called with a mobile that does not match `^91[6-9]\d{9}$`
- **THEN** the method SHALL return `{ success: false, message: "Invalid mobile format" }` without making any HTTP request

---

### Requirement: Structured logging for OTP events
The module SHALL emit log entries for exactly three events using the project's existing logger (or `console` if none): OTP sent, OTP send failure, and OTP verification failure. No log SHALL include the raw OTP value.

#### Scenario: OTP sent log
- **WHEN** MSG91 accepts the OTP send request
- **THEN** the module SHALL log at INFO level: `"OTP sent to <masked-mobile>"` (last 4 digits visible, e.g. `91XXXXXX1234`)

#### Scenario: OTP send failure log
- **WHEN** MSG91 rejects or an error is thrown during send
- **THEN** the module SHALL log at ERROR level: `"OTP send failed for <masked-mobile>: <error-message>"`

#### Scenario: OTP verification failure log
- **WHEN** MSG91 rejects the verify call or an error is thrown during verify
- **THEN** the module SHALL log at ERROR level: `"OTP verification failed for <masked-mobile>: <error-message>"`

---

### Requirement: Standardised response envelope
Every public method in `msg91.service.js` SHALL return a plain object matching `{ success: boolean, message: string, data?: object }`. Methods SHALL never throw; all errors are caught internally and returned as `{ success: false, message: <string> }`.

#### Scenario: Successful response shape
- **WHEN** any method completes successfully
- **THEN** the returned object SHALL have `success: true`, a non-empty `message` string, and optionally a `data` field containing the MSG91 API response body

#### Scenario: Failure response shape
- **WHEN** any method encounters an error
- **THEN** the returned object SHALL have `success: false` and a non-empty human-readable `message` string; no exception SHALL propagate to the caller

---

### Requirement: Mobile number normalisation
The module SHALL normalise the incoming mobile number before validation: strip a leading `+` if present and remove a duplicate country-code prefix (`9191`) if detected.

#### Scenario: Mobile passed with leading plus
- **WHEN** `sendOTP` or `verifyOTP` is called with `+91XXXXXXXXXX`
- **THEN** the module SHALL strip the `+` and treat the number as `91XXXXXXXXXX`

#### Scenario: Mobile passed with duplicate country code
- **WHEN** the mobile starts with `9191`
- **THEN** the module SHALL reduce it to `91XXXXXXXXXX` before validation and API call
