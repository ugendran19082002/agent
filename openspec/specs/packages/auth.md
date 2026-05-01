# Package: auth

## Responsibility
Handles identity verification, session management, and token lifecycle for all user roles.

## Classes / Components
| Component | Kind | Role |
|---|---|---|
| `auth.controller` | function | HTTP handlers for login, OTP verify, token refresh, logout |
| `AuthService` | function (service) | Business logic for OTP generation/validation, JWT issuance |
| `User` model | struct | Platform user record — role, credentials, status |
| `Customer` model | struct | Customer-specific profile linked to User |
| `DeliveryPerson` model | struct | Delivery person profile linked to User |
| `OTPLog` model | struct | OTP attempt audit trail |
| `RefreshToken` model | struct | Persisted refresh token records |
| `UserDevice` model | struct | Device registration for push notification targeting |

## Dependencies
- **Backend:** `jsonwebtoken`, `bcrypt`, Firebase Admin (phone auth helpers), `express-validator`
- **Frontend:** `api/authApi.ts` — login, OTP, token refresh calls; `stores/securityStore.ts` — PIN/biometric state; `expo-secure-store` — token persistence; `expo-local-authentication` — biometric unlock

## Notes
- Access tokens are short-lived JWTs; refresh tokens are stored in the database
- OTP delivery channel is configurable (SMS / email)
- Role is encoded in the JWT payload and enforced by backend route middleware
