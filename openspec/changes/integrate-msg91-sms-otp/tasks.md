## 1. Environment & Dependencies

- [x] 1.1 Add `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`, and `MSG91_SENDER_ID` entries to `.env.example` with placeholder values and inline comments
- [x] 1.2 Verify `axios` is present in `package.json`; add it (`npm install axios`) if missing

## 2. Create msg91.service.js

- [x] 2.1 Create `msg91.service.js` in the project's services directory (e.g. `src/services/msg91.service.js`) and load the three MSG91 env vars at module init; emit a warning log and mark module unconfigured if any are absent
- [x] 2.2 Implement mobile normalisation helper: strip leading `+`, collapse duplicate `9191` prefix, then validate against `^91[6-9]\d{9}$`; return `{ success: false, message: "Invalid mobile format" }` on failure without making any HTTP request
- [x] 2.3 Implement `sendOTP(mobile, otp)`: normalise mobile → POST to MSG91 Send OTP API via Axios with `authkey`, `template_id`, `sender`, `mobile`, and `otp` in the request body; return `{ success: true, message: "OTP sent successfully", data: <response> }` on success
- [x] 2.4 Add error handling to `sendOTP`: catch Axios/network errors and MSG91 error responses, log `"OTP send failed for <masked-mobile>: <error>"` at ERROR level, return `{ success: false, message: "Failed to send OTP" }` — never re-throw
- [x] 2.5 Implement `verifyOTP(mobile, otp)`: normalise mobile → GET/POST to MSG91 Verify OTP API via Axios; return `{ success: true, message: "OTP verified successfully", data: <response> }` on success
- [x] 2.6 Add error handling to `verifyOTP`: catch all errors, log `"OTP verification failed for <masked-mobile>: <error>"` at ERROR level, return `{ success: false, message: "OTP verification failed" }` — never re-throw
- [x] 2.7 Add success log `"OTP sent to <masked-mobile>"` at INFO level inside `sendOTP` after a confirmed successful API response; mask mobile to show only last 4 digits (e.g. `91XXXXXX1234`)

## 3. Wire into Auth/OTP Service

- [x] 3.1 Locate the existing OTP dispatch call site in the auth or OTP service layer (where the previous SMS provider was called)
- [x] 3.2 Replace the previous SMS provider call with `msg91Service.sendOTP(mobile, otp)`; check `result.success` and propagate failure back to the controller as-is
- [x] 3.3 If `verifyOTP` is used at the service layer, replace the previous verify call with `msg91Service.verifyOTP(mobile, otp)` and handle `result.success` accordingly

## 4. Example Integration

- [x] 4.1 Add a concise inline code comment block (or a separate `msg91.example.js` file) showing how the auth controller calls `sendOTP` after OTP generation and how it handles the returned envelope — include the expected request/response shapes

## 5. Smoke Test

- [ ] 5.1 Test `sendOTP` against the MSG91 staging/sandbox environment with a real mobile number and confirm the SMS is received
- [ ] 5.2 Test `verifyOTP` with the correct OTP and confirm `success: true` is returned
- [ ] 5.3 Test `verifyOTP` with an incorrect OTP and confirm `success: false` and the failure log are emitted
- [ ] 5.4 Test with a missing env var and confirm the module warns at startup and returns the configuration-missing response without making HTTP calls
<!-- Smoke tests (5.1–5.4) require live MSG91 credentials and a real SIM — run manually in staging before production deploy -->
