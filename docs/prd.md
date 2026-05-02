# ThanniGo — Product Requirements Document v2.0 | CONFIDENTIAL

**ThanniGo**  
Hyperlocal Water Delivery Platform

**PRODUCT REQUIREMENTS DOCUMENT**  
PRD v2.0 | Based on OpenSpec v2.6

| **Field** | **Detail** |
|---|---|
| Document Version | PRD v2.0 (Updated) |
| Based On | OpenSpec v2.6 (Production) |
| App Name | ThanniGo |
| Platform | React Native (iOS & Android) — Single App, 4 Roles |
| Launch City | Chennai, India |
| Language | English (MVP) |
| Payment Gateway | Razorpay |
| Database | MySQL (Sequelize ORM) |
| Backend | Node.js + Express.js |
| Real-time | Socket.io (WebSocket) |
| Maps | Mapbox SDK |
| Email | Brevo (Transactional) |
| SMS | MSG91 (OTP Fallback) |
| Push Notifications | Firebase FCM (Android) + APNs (iOS) |
| File Storage | Hetzner Server (Self-managed VM) |
| Release Strategy | Phased: Admin → Shop → Customer |
| Date | 2 May 2026 |
| Status | Draft for Review |

---

# 1. Introduction

## 1.1 Purpose

This Product Requirements Document (PRD) defines the complete functional and non-functional requirements for ThanniGo — a hyperlocal delivery platform connecting customers with local shops for water can distribution and general grocery delivery, with initial launch in Chennai, India.

This document is the single source of truth for product, design, and engineering teams. It covers all role-based components of the platform delivered via a single React Native application.

## 1.2 Scope

This PRD covers MVP scope only. Features marked Phase 2 are documented for context but are not part of the initial release. There is no web portal — all functionality is delivered through the React Native mobile app.

## 1.3 Stakeholders

| **Role** | **Responsibility** |
|---|---|
| Product Owner | Feature prioritization, acceptance criteria |
| Engineering Lead | Technical feasibility, API design |
| UI/UX Designer | Screen design, interaction flows |
| QA Lead | Test case creation, validation coverage |
| Business Stakeholder | Business logic sign-off |

## 1.4 System Actors

| **Actor** | **Description** | **Access Method** |
|---|---|---|
| Customer | Places orders, tracks delivery, manages loyalty & referrals | React Native App (Customer role) |
| Shop Owner | Manages shop, products, orders, delivery staff | React Native App (Shop Owner role) |
| Delivery Person | Picks up and delivers orders, manages can returns | React Native App (Delivery role) |
| Super Admin | Approves shops, manages platform coupons, resolves complaints | React Native App (Admin role) |

## 1.5 Phased Release Plan

| **Phase** | **Component** | **Key Deliverables** |
|---|---|---|
| Phase 1 | Admin | Shop approval workflow, platform coupon management, system settings, complaint resolution |
| Phase 2 | Shop Owner App | Onboarding, product management, order handling, delivery staff, shop analytics |
| Phase 3 | Customer App | Ordering, payment, tracking, loyalty, coupons, referrals, complaints |

---

# 2. Assumptions & Dependencies

## 2.1 Assumptions

- All users authenticate via Phone + PIN. No email/password or social login.
- Platform launches exclusively in Chennai, India. Multi-city support is a future enhancement.
- App is English-only for MVP.
- Dark mode is supported from day one across ALL roles including Admin.
- There is no customer web portal. The React Native app is the only customer-facing interface.
- Admin account is manually seeded by the engineering team. No self-registration for Admin.
- All three customer-facing roles (Customer, Shop Owner, Delivery Person) plus Admin share the same React Native app with role-based routing post-login.
- Payment gateway is Razorpay only. All refunds return to original payment method.
- Only two can sizes supported: 20L and 10L, tracked independently per customer.
- Loyalty points have a fixed 6-month expiry from earning date.
- Push notifications + email are the primary communication channels. SMS is OTP fallback only.
- Delivery person accounts are created by shop owners — no self-registration.
- Minimum order value is configured per shop by the shop owner.
- A single phone number can only be associated with one role across the entire platform.

## 2.2 Dependencies

| **Dependency** | **Type** | **Purpose** | **Notes** |
|---|---|---|---|
| Razorpay | External — Payment | UPI, card, wallet payments & refunds | PCI-DSS compliance delegated to Razorpay |
| Firebase FCM / APNs | External — Push | Push notifications | Android (FCM) + iOS (APNs) |
| Brevo | External — Email | All transactional emails | OTP primary, order confirmations, approvals |
| MSG91 | External — SMS | OTP fallback only | Used only if Brevo email delivery fails |
| Mapbox SDK | External — Maps | All map views, GPS tracking, navigation | Replaces Google Maps entirely |
| Mapbox Navigation SDK | External — Navigation | Delivery person in-app turn-by-turn navigation | Fully in-app, no external maps app |
| Socket.io | Internal — Real-time | Live GPS tracking, order status updates, charge approvals | Node.js WebSocket layer |
| MySQL + Sequelize | Internal — Database | Primary data store with ORM | All core tables implemented |
| Hetzner Server | Internal — Storage | File and image storage (self-managed VM) | DevOps team manages CDN config |
| Node.js + Express | Internal — Backend | API server | Versioned REST API at /api/v1/... |
| React Native | Framework — Mobile | iOS + Android app for all 4 roles | Single codebase, role-based routing |
| Play Store / App Store | Distribution | App submission and review | |

---

# 3. Non-Functional Requirements

## 3.1 Performance

| **Metric** | **Target** | **Notes** |
|---|---|---|
| API Response Time (P95) | < 500ms | All standard CRUD endpoints |
| API Response Time (P99) | < 1000ms | Under peak load |
| App Cold Start | < 3 seconds | iOS and Android |
| Order Placement to Confirmation | < 2 seconds | End-to-end including payment |
| Real-time GPS Update Interval | ≤ 5 seconds | Delivery tracking refresh via Socket.io |
| Map Load Time (Mapbox) | < 2 seconds | Customer tracking screen |
| Image Upload (Onboarding Docs) | < 10 seconds | Per image on 4G to Hetzner storage |
| Concurrent Users (MVP Launch) | 1,000 | Chennai market estimate |

## 3.2 Security

- All API communication over HTTPS/TLS 1.3.
- PIN stored as bcrypt hash (min 12 rounds). Never stored in plaintext.
- JWT tokens for session management. Access token expiry: 15 minutes. Refresh token expiry: 30 days.
- OTP valid for 5 minutes. Max 3 OTP attempts before lockout (10-minute cooldown).
- PIN locked after 3 consecutive wrong attempts. Unlock only via OTP verification.
- Razorpay handles all card/UPI data. PCI-DSS compliance delegated to Razorpay.
- All uploaded documents (Aadhaar, PAN) stored on Hetzner with access-controlled URLs.
- Role-based access control (RBAC) enforced at API layer, not just UI.
- Sensitive fields (account number, Aadhaar) masked in API responses.
- Rate limiting on all public endpoints. Max 5 OTP requests per phone per hour.

## 3.3 Scalability

- Database schema designed with future multi-city support (city_id column in key tables).
- Stateless API design to allow horizontal scaling.
- Image/document storage on Hetzner self-managed VM with CDN configuration by DevOps team.
- Real-time GPS updates via Socket.io with polling fallback (5-second interval) on degraded connections.

## 3.4 Reliability & Availability

- Target uptime: 99.5% for MVP.
- Graceful degradation: if real-time tracking fails, fall back to status-based updates.
- All payment transactions idempotent — duplicate order prevention enforced via idempotency keys.
- Order state machine with rollback on payment failure — if payment succeeds but order creation fails, auto-refund is triggered immediately (PAY0006).

## 3.5 Dark Mode

> ℹ Dark mode is supported across ALL four roles in the React Native app: Customer, Shop Owner, Delivery Person, and Admin.

- System-level dark mode detection (follows OS setting) with manual override in app settings.

## 3.6 Logging Standards

All errors are logged with unique error codes following this convention: `[MODULE][SEQUENCE]` — e.g., AUTH0001, ORD0012, PAY0003

| **Module Prefix** | **Domain** |
|---|---|
| AUTH | Authentication & PIN management |
| USER | User registration & profile |
| SHOP | Shop onboarding & management |
| PROD | Product & category management |
| ORD | Order lifecycle |
| DEL | Delivery lifecycle |
| PAY | Payment & refunds |
| LOY | Loyalty points system |
| CAN | Water can & deposit system |
| CPN | Coupon system |
| CUST | Customer management |
| NOTIF | Notifications |
| ADMIN | Admin portal operations |
| REF | Referral system |
| COMP | Complaints |
| SYS | System & infrastructure |

---

# 4. User Roles & Permissions

## 4.1 Role Overview

| **Role** | **Auth Method** | **Access** | **Created By** |
|---|---|---|---|
| Customer | Phone + PIN | React Native App (Customer role) | Self-registration |
| Shop Owner | Phone + PIN | React Native App (Shop Owner role) | Self-registration + Admin approval |
| Delivery Person | Phone + PIN | React Native App (Delivery role) | Created by Shop Owner |
| Super Admin | Phone + PIN | React Native App (Admin role) | Manual seed by engineering team |

> ℹ One phone number = one role only. No dual-role accounts. This rule applies to Admin too.

## 4.2 Permission Matrix

| **Feature** | **Customer** | **Shop Owner** | **Delivery Person** | **Admin** |
|---|---|---|---|---|
| Place Orders | Yes | No | No | No |
| View Own Orders | Yes | Yes (shop orders) | Yes (assigned) | Yes (all) |
| Accept/Reject Orders | No | Yes | No | No |
| Cancel Order (before pickup) | Yes | No | No | No |
| Manage Products | No | Yes | No | No |
| Approve Shop Applications | No | No | No | Yes |
| Create Platform Coupons | No | No | No | Yes |
| Create Shop Coupons | No | Yes | No | No |
| Manage Delivery Staff | No | Yes | No | No |
| Update Delivery Status | No | No | Yes | No |
| View Loyalty Points | Yes (own) | No | No | No |
| Block Customers | No | Yes (own shop) | No | No |
| View Shop Analytics | No | Yes (own shop) | No | Yes (all) |
| Resolve Complaints | No | No | No | Yes |
| System Settings | No | No | No | Yes |
| Toggle Shop Open/Close | No | Yes | No | No |

---

# 5. Authentication & PIN Management

## 5.1 Overview

Authentication is unified across all roles using Phone Number + PIN. Post-login, the system detects the user's role and routes them to the appropriate dashboard. A single phone number can only be associated with one role.

## 5.2 Splash Screen / App Launch

- If valid JWT access token exists locally → auto-login → route to role dashboard.
- If token expired but refresh token valid → silently refresh → route to role dashboard.
- If no token or refresh token expired → show Phone Number screen.

### App Launch Error Scenarios

| **Scenario** | **Log Code** | **User Message** | **Action** |
|---|---|---|---|
| Token refresh fails (network) | AUTH0001 | Connection error. Please try again. | Retry button shown |
| Token refresh fails (invalid) | AUTH0002 | Session expired. Please log in again. | Redirect to Phone screen |
| App version outdated | SYS0001 | Please update the app to continue. | Force update screen shown — app blocked until updated |

> ⚠ SYS0001 (Force Update): When the installed app version is below the minimum required version, a full-screen force update prompt is shown immediately on launch. No other interaction is permitted until the user updates via the store link provided.

## 5.3 Phone Number Entry

| **Field** | **Type** | **Validation** | **Required** |
|---|---|---|---|
| Phone Number | Numeric input | Exactly 10 digits, starts with 6–9 | Yes |
| Country Code | Display only | +91 (fixed for MVP) | N/A |

- If existing user → navigate to PIN Entry screen.
- If new user → navigate to Role Selection screen.

### Phone Number Negative Scenarios

| **Scenario** | **Log Code** | **Validation Rule** | **User Message** |
|---|---|---|---|
| Number < 10 digits | AUTH0003 | Client-side | Enter a valid 10-digit mobile number. |
| Number starts with 0–5 | AUTH0004 | Client-side | Enter a valid Indian mobile number. |
| Network error on check | AUTH0005 | Server-side | Unable to connect. Please try again. |
| Too many attempts (rate limit) | AUTH0006 | Server-side | Too many attempts. Try after 10 minutes. |
| Empty input on submit | AUTH0007 | Client-side | Please enter your mobile number. |

## 5.4 PIN Entry (Existing User)

- User enters 4-digit PIN (masked).
- Backend validates PIN hash.
- On success: issue JWT access + refresh tokens → route to role dashboard.
- 3 wrong attempts → PIN locked → Forgot PIN flow mandatory.

### PIN Entry Negative Scenarios

| **Scenario** | **Log Code** | **Rule** | **User Message** |
|---|---|---|---|
| Wrong PIN (1st attempt) | AUTH0008 | Server-side | Incorrect PIN. 2 attempts remaining. |
| Wrong PIN (2nd attempt) | AUTH0009 | Server-side | Incorrect PIN. 1 attempt remaining. |
| Wrong PIN (3rd attempt — lockout) | AUTH0010 | Server-side | PIN locked. Please reset via OTP. |
| PIN locked state on screen load | AUTH0011 | Server-side | Your PIN is locked. Tap Forgot PIN to reset. |
| Network error during validation | AUTH0012 | Server-side | Connection error. Please try again. |
| Non-numeric input | AUTH0013 | Client-side | PIN must be numeric. |

### PIN Lockout State

- After 3 wrong attempts, PIN is flagged as locked in DB.
- Forgot PIN link becomes highlighted/mandatory.
- No further PIN entry allowed until OTP reset is complete.
- Lockout counter resets after successful PIN reset.

## 5.5 Forgot PIN / PIN Reset Flow

- User taps Forgot PIN on PIN Entry screen.
- System sends OTP to registered email via Brevo (primary channel).
- If Brevo email delivery fails within 30 seconds → system sends SMS OTP via MSG91 (fallback).
- User enters 6-digit OTP → on success → Set New PIN screen.
- New PIN saved (hashed). Lockout counter reset. User auto-logged in.

| **Rule** | **Value** |
|---|---|
| OTP length | 6 digits |
| OTP validity | 5 minutes from send time |
| Max OTP attempts | 3 (then 10-minute cooldown) |
| Max OTP resend | 3 per session |
| Resend cooldown | 30 seconds between resends |

### OTP Negative Scenarios

| **Scenario** | **Log Code** | **User Message** |
|---|---|---|
| Wrong OTP entered | AUTH0014 | Incorrect OTP. X attempts remaining. |
| OTP expired | AUTH0015 | OTP has expired. Tap Resend OTP. |
| Max OTP attempts exceeded | AUTH0016 | Too many attempts. Please wait 10 minutes. |
| Email + SMS both fail | AUTH0017 | Unable to send OTP. Contact support. |

## 5.6 Set New PIN Screen

| **Field** | **Validation** |
|---|---|
| New PIN | 4 digits, numeric, not same as old PIN, not sequential (1234) or repeated (1111) |
| Confirm PIN | Must match New PIN exactly |

### Set New PIN Negative Scenarios

| **Scenario** | **Log Code** | **User Message** |
|---|---|---|
| New PIN same as old PIN | AUTH0018 | New PIN cannot be the same as your current PIN. |
| PIN confirmation mismatch | AUTH0019 | PINs do not match. Please re-enter. |
| Weak PIN (e.g., 1111, 1234) | AUTH0020 | Choose a stronger PIN (avoid repeated/sequential digits). |

## 5.7 Authentication Log Codes Summary

| **Log Code** | **Event** | **Severity** |
|---|---|---|
| AUTH0001 | Token refresh — network error | WARN |
| AUTH0002 | Token refresh — invalid token | ERROR |
| AUTH0003 | Phone validation — length error | INFO |
| AUTH0004 | Phone validation — format error | INFO |
| AUTH0005 | Phone check — network error | ERROR |
| AUTH0006 | Phone check — rate limited | WARN |
| AUTH0007 | Phone — empty input | INFO |
| AUTH0008 | PIN wrong — attempt 1 | INFO |
| AUTH0009 | PIN wrong — attempt 2 | WARN |
| AUTH0010 | PIN lockout triggered | ERROR |
| AUTH0011 | PIN screen loaded — locked state | WARN |
| AUTH0012 | PIN validation — network error | ERROR |
| AUTH0013 | PIN — non-numeric input | INFO |
| AUTH0014 | OTP wrong | INFO |
| AUTH0015 | OTP expired | WARN |
| AUTH0016 | OTP max attempts exceeded | ERROR |
| AUTH0017 | OTP delivery failure (both channels) | CRITICAL |
| AUTH0018 | PIN reset — same as old | INFO |
| AUTH0019 | PIN confirm mismatch | INFO |
| AUTH0020 | Weak PIN pattern detected | INFO |
| SYS0001 | App version outdated — force update | WARN |

---

# 6. New User Registration

## 6.1 Role Selection Screen

When a new phone number is detected, the user is shown a Role Selection screen. Only two self-registration options are available:

| **Option** | **Leads To** | **Notes** |
|---|---|---|
| I am a Customer | Customer Registration (name + PIN) | Minimal — 2 fields only |
| I am a Shop Owner | Shop Onboarding — 4-step flow | Full onboarding with document verification (mobile only) |

> ℹ Delivery Person accounts are NOT self-registered. Created by Shop Owner. Admin accounts are NOT self-registered. Created by engineering team (manual seed).

## 6.2 Customer Registration

| **Field** | **Validation** | **Required** |
|---|---|---|
| Full Name | Min 2 chars, max 60 chars, letters + spaces only | Yes |
| New PIN | 4 numeric digits, not sequential/repeated | Yes |
| Confirm PIN | Must match New PIN exactly | Yes |

- On success: account created → JWT tokens issued → 50 loyalty points credited on first completed order (not at registration).
- Redirect to Customer Home Screen.

### Customer Registration Negative Scenarios

| **Scenario** | **Log Code** | **User Message** |
|---|---|---|
| Name too short (< 2 chars) | USER0001 | Name must be at least 2 characters. |
| Name contains numbers/symbols | USER0002 | Name can only contain letters and spaces. |
| PIN is sequential (1234, 4321) | USER0003 | Choose a stronger PIN. |
| PIN is repeated (1111, 2222) | USER0004 | Choose a stronger PIN. |
| PIN confirmation mismatch | USER0005 | PINs do not match. |
| Phone already registered (race condition) | USER0006 | This number is already registered. Please log in. |
| Network error on account creation | USER0007 | Account creation failed. Please try again. |

## 6.3 Delivery Person — Account Creation by Shop Owner

Delivery persons are not self-registered. The shop owner creates their account from the Shop Dashboard.

| **Step** | **Action** | **Notes** |
|---|---|---|
| 1 | Shop owner enters delivery person name, phone number, vehicle type, and sets initial PIN | Initial PIN set by shop owner |
| 2 | System creates delivery person account | No SMS sent — shop owner communicates PIN manually |
| 3 | Delivery person opens app for first time | App detects first-time login, goes straight to PIN setup screen |
| 4 | Delivery person sets their own PIN | Initial shop owner PIN is replaced |
| 5 | Shop owner can reset PIN if needed | New PIN set directly by shop owner and communicated manually |

## 6.4 Shop Owner Onboarding — Overview

> ℹ Shop onboarding is mobile-only. All 4 steps must be completed sequentially. Admin can only Approve/Reject — not edit any step.

| **Step** | **Name** | **Key Data** |
|---|---|---|
| Step 1 | Basic Details | Shop info, owner info, business type |
| Step 2 | Verification Documents | Live photo (camera), Aadhaar, PAN |
| Step 3 | Payment Details | Bank account, UPI |
| Step 4 | Live Location | GPS coordinates via Mapbox |

## 6.5 Step 1 — Basic Details

| **Field** | **Required** | **Validation** |
|---|---|---|
| Business Category | Yes | Select from predefined list |
| Shop Name | Yes | 2–80 characters |
| GST Number | No | Valid GST format if entered: 15 alphanumeric chars |
| Shop Email | Yes | Valid email format, unique in system |
| Shop Phone Number | Yes | 10-digit Indian mobile number |
| Owner Name | Yes | 2–60 chars, letters + spaces |
| Owner Email | Yes | Valid email format |
| Owner Phone | Yes | Must match registered phone number |
| Alternate Number | No | 10-digit Indian mobile if entered |
| Shop Type | Yes | Residential / Commercial / Both |
| Business Type | Yes | 2–100 chars |

### Step 1 Negative Scenarios

| **Scenario** | **Log Code** | **User Message** |
|---|---|---|
| Shop Email already registered | SHOP0001 | This email is already in use. |
| Invalid GST format | SHOP0002 | Enter a valid 15-character GST number. |
| Shop phone same as alternate | SHOP0003 | Alternate number must differ from shop number. |
| Shop type not selected | SHOP0004 | Please select a shop type. |
| Network error on save | SHOP0005 | Unable to save. Please try again. |

## 6.6 Step 2 — Verification Documents

| **Document** | **Required** | **Method** | **Validation** |
|---|---|---|---|
| Live Shop Photo | Yes | Camera only (real-time) | No gallery upload allowed |
| Owner Photo | Yes | Camera only (real-time) | No gallery upload allowed |
| Shop Photo (exterior) | No | Camera or upload | JPEG/PNG, max 5MB |
| Aadhaar Card — Front | Yes | Upload | JPEG/PNG/PDF, max 5MB |
| Aadhaar Card — Back | Yes | Upload | JPEG/PNG/PDF, max 5MB |
| PAN Card | Yes | Upload | JPEG/PNG/PDF, max 5MB |

### Step 2 Negative Scenarios

| **Scenario** | **Log Code** | **User Message** |
|---|---|---|
| Camera permission denied | SHOP0006 | Camera access is required. Enable in settings. |
| File too large (> 5MB) | SHOP0007 | File exceeds 5MB limit. Please use a smaller file. |
| Invalid file type | SHOP0008 | Only JPEG, PNG, and PDF files are accepted. |
| Live photo requirement bypassed | SHOP0009 | Live photo must be taken via camera. |
| Upload fails (network) | SHOP0010 | Upload failed. Please check your connection. |

## 6.7 Step 3 — Payment Details

| **Field** | **Required** | **Validation** |
|---|---|---|
| Bank Name | Yes | Select from list |
| Account Holder Name | Yes | 2–60 chars, must match owner name |
| Account Number | Yes | 9–18 digits, numeric only |
| IFSC Code | Yes | 11 chars: 4 alpha + 0 + 6 alphanumeric |
| UPI ID | No | Valid UPI format (xxx@yyy) if entered |
| Bank Statement | No | PDF/image, max 10MB |

### Step 3 Negative Scenarios

| **Scenario** | **Log Code** | **User Message** |
|---|---|---|
| Invalid IFSC format | SHOP0011 | Enter a valid IFSC code (e.g., HDFC0001234). |
| Account number non-numeric | SHOP0012 | Account number must contain digits only. |
| Invalid UPI format | SHOP0013 | Enter a valid UPI ID (e.g., name@upi). |
| Bank statement too large | SHOP0014 | File exceeds 10MB limit. |

## 6.8 Step 4 — Live Location (Mapbox)

- User taps Capture Location — app requests device GPS permission.
- GPS coordinates captured and displayed on Mapbox map with a pin.
- User confirms pin location is accurate.
- Coordinates saved as shop's registered address.
- Manual address entry alone is not accepted for this step.

### Step 4 Negative Scenarios

| **Scenario** | **Log Code** | **User Message** |
|---|---|---|
| GPS permission denied | SHOP0015 | Location access is required. Enable in device settings. |
| GPS signal unavailable | SHOP0016 | Unable to get location. Move to an open area and retry. |
| Low accuracy GPS (> 50m) | SHOP0017 | Location accuracy is low. Retry for better precision. |
| User skips confirmation | SHOP0018 | Please confirm your shop location before proceeding. |

## 6.9 Post-Submission: Waitlist Screen

| **Status** | **Description** | **Owner Action** |
|---|---|---|
| Under Review | Application submitted, awaiting admin | None |
| Pending Re-submission | Admin rejected one step | Edit only the rejected step |
| Approved | All steps approved | Redirect to Post-Approval flow |
| Permanently Rejected | Admin permanently rejected (Phase 2) | Contact support |

---

# 7. Admin — Role & Features

## 7.1 Overview

The Super Admin role operates within the same React Native app as all other roles. On login with an admin-flagged account, the system routes to the Admin Dashboard. Admin accounts are manually seeded by the engineering team — no self-registration.

> ℹ Admin MVP covers four areas: Shop Approval, Platform Coupon Management, System Settings, and Complaint Resolution.

## 7.2 Admin Dashboard

| **Card** | **Data Shown** | **Action** |
|---|---|---|
| Pending Applications | Count of shops awaiting review | Tap → Shop List (Pending) |
| Pending Re-submissions | Count of shops awaiting re-review | Tap → Shop List (Re-submissions) |
| Approved Shops | Total approved shops | Tap → All Shops list |
| Active Coupons | Count of active platform coupons | Tap → Coupon List |
| Open Complaints | Count of unresolved complaints | Tap → Complaints List |
| Refund Abuse Users | Count of users flagged for refund abuse (30-day window) | Tap → User Abuse Report |
| COD Blocked Users | Count of users with COD disabled | Tap → COD Blocked Users List |
| Failed Deliveries | Count of failed deliveries (today / this week) | Tap → Failed Delivery Report |
| Shop Rejection % | % of orders rejected by shops (this week) | Tap → Shop Performance Report |

## 7.3 Shop List — Filters & Table Columns

### Filters

- **Status:** All / Pending / Under Review / Pending Re-submission / Approved
- **Business Category**
- **Date Submitted** (date range)
- **Search** by shop name or owner phone

### Table Columns

| **Column** | **Description** |
|---|---|
| Shop Name | Business name from Step 1 |
| Owner Name | Owner name from Step 1 |
| Category | Business category |
| Submitted On | Application submission date |
| Status | Current review status (badge) |
| Action | Review button → opens step-wise review |

## 7.4 Shop Approval Workflow

- Admin reviews each of the 4 onboarding steps independently in a tabbed layout.
- Admin must Approve or Reject each step — blank actions not permitted.
- Rejection requires a written remark (mandatory, min 10 chars).
- On rejection, only that step is unlocked for the owner to edit. Approved steps remain locked.
- When all 4 steps are Approved → shop status changes to Approved → owner notified via push + Brevo email.

### Admin Review Negative Scenarios

| **Scenario** | **Log Code** | **Behaviour** |
|---|---|---|
| Admin submits rejection without remark | ADMIN0001 | Form error: Rejection reason is required (min 10 chars). |
| Admin approves already-approved step | ADMIN0002 | System ignores duplicate approval silently. |
| Network error on approve/reject submit | ADMIN0003 | Error toast shown. Action not recorded. Retry required. |
| Shop re-submits while admin is reviewing | ADMIN0004 | Admin sees updated submission. Timestamp refreshed. |
| Non-admin phone attempted admin login | ADMIN0005 | Access denied. Admin role not found for this number. |
| Coupon creation failed | ADMIN0006 | Coupon save to DB failed. Please try again. |
| Shop approval notification failed | ADMIN0007 | Push/email to shop owner failed post-approval. Admin alerted. |

## 7.5 System Settings (Admin)

Admin manages platform-wide configurable settings from a dedicated System Settings screen.

| **Setting** | **Description** | **Default** |
|---|---|---|
| Order Accept Timeout | Minutes before order auto-rejects if shop doesn't respond | 10 minutes |
| COD Block Threshold | Number of failed/cancelled COD orders before COD is disabled | 3 |
| Refund Window (days) | Rolling window for UPI cancellation tier tracking | 30 days |
| OTP Expiry (minutes) | OTP validity duration | 5 minutes |
| Max OTP Attempts | Max wrong OTP attempts before cooldown | 3 |
| OTP Cooldown (minutes) | Cooldown period after max OTP attempts | 10 minutes |
| Loyalty Points Expiry (months) | Months from earning date before points expire | 6 months |
| COD Starting Limit | Initial COD order limit for new customers | 5 |
| COD Max Limit | Maximum COD limit a customer can reach | 10 |
| Max Saved Addresses | Maximum delivery addresses per customer | 5 |
| No-Response Wait Time (minutes) | Time delivery person must wait before marking no response | 10 minutes |
| No-Response Call Attempts | Minimum logged call attempts before marking no response | 2 |

## 7.6 Platform Coupon Management

See Section 12 (Coupon System) for full coupon creation and management flows. For admin platform coupons: platform absorbs the discount; shop receives full order amount.

## 7.7 Complaint Resolution

See Section 16 (Complaints) for full complaint flow. Admin is the sole resolver of all complaints in MVP.

## 7.8 Admin Log Codes

| **Log Code** | **Event** | **Severity** |
|---|---|---|
| ADMIN0001 | Rejection without remark | WARN |
| ADMIN0002 | Duplicate approval | INFO |
| ADMIN0003 | Review submit network error | ERROR |
| ADMIN0004 | Shop re-submission during review | INFO |
| ADMIN0005 | Non-admin phone attempted admin login | ERROR |
| ADMIN0006 | Coupon creation failed | ERROR |
| ADMIN0007 | Shop approval notification failed | ERROR |

---

# 8. Shop Owner Dashboard

## 8.1 Overview

The Shop Owner Dashboard is accessible only to approved shop owners. It provides full operational control: shop settings, product management, order handling, delivery staff management, customer management, and analytics.

## 8.2 Shop Open / Close Toggle

- Shop owner can toggle their shop between Open and Closed states.
- When Closed: shop is still visible to customers on the home screen, marked 'Currently Closed'. New orders are blocked.
- When Closed: existing orders already in progress continue to be processed normally.

## 8.3 Dashboard Home — Summary Cards

| **Card** | **Data** |
|---|---|
| Today's Orders | Total orders received today |
| Pending Orders | Orders awaiting accept/reject |
| Out for Delivery | Active delivery count |
| Today's Revenue | Sum of accepted order values today |

## 8.4 Post-Approval: Shop Settings Configuration

After approval, the Shop Owner configures operational settings before going live. When shop type is 'Both', settings are configured independently for each zone (Residential and Commercial).

| **Setting Group** | **Fields** | **Notes** |
|---|---|---|
| Minimum Order Value | min_order_value (₹) | Set per shop — shown to customer at cart |
| Order Quantity | min_qty, max_qty | Applied to all orders from this shop |
| Delivery Radius & Pricing | free_delivery_km, per_km_price, max_delivery_km | Per zone (Residential / Commercial) |
| Floor Charge | free_floor, per_floor_charge, lift_charge | Per zone — lift_charge always shown to customer |
| Instant Delivery | is_instant (toggle), from_time, to_time, grace_time | Fields hidden when is_instant is OFF |

> ⚠ lift_charge is always shown to the customer. Hidden charges of any kind are not permitted.

## 8.5 Product & Category Management

### 8.5.1 Category Management

Shop owner can create, edit, and delete product categories and sub-categories.

| **Field** | **Validation** |
|---|---|
| Category Name | 2–50 chars, unique within shop |
| Sub-category Name | 2–50 chars, unique within category |
| Display Order | Integer, controls sort order on customer app |

#### Category Negative Scenarios

| **Scenario** | **Log Code** | **User Message** |
|---|---|---|
| Duplicate category name | PROD0001 | A category with this name already exists. |
| Delete category with active products | PROD0002 | Remove or reassign all products before deleting. |
| Category name too short | PROD0003 | Category name must be at least 2 characters. |

### 8.5.2 Product Add / Edit

| **Field** | **Required** | **Validation** |
|---|---|---|
| Product Name | Yes | 2–100 chars |
| Category | Yes | Must select existing category |
| Sub-category | No | Optional |
| Base Price (₹) | Yes | Positive number, max 2 decimal places |
| Min Quantity | Yes | Integer ≥ 1 |
| Max Quantity | Yes | Integer ≥ min_qty |
| Product Images | Yes | Min 1, max 5 images, JPEG/PNG, max 3MB each (stored on Hetzner) |
| Is Water Product | Yes | Toggle: Yes/No — enables deposit logic if Yes |
| Can Size (if water) | Conditional | 20L or 10L — required if is_water = true |
| Deposit Amount (if water) | Conditional | Positive number — shop-configurable per can size |
| Product Active/Inactive | Yes | Toggle — inactive products hidden from customer app |

#### Product Negative Scenarios

| **Scenario** | **Log Code** | **User Message** |
|---|---|---|
| Duplicate product name in category | PROD0004 | A product with this name already exists in this category. |
| Max qty less than min qty | PROD0005 | Max quantity must be greater than or equal to min quantity. |
| Image file too large | PROD0006 | Image exceeds 3MB limit. |
| No image uploaded | PROD0007 | At least one product image is required. |
| Water product without can size | PROD0008 | Please select a can size for water products. |
| Deposit amount not set for water product | PROD0009 | Please set a deposit amount for this can size. |
| Price is zero or negative | PROD0010 | Price must be greater than zero. |

### 8.5.3 Product Rule Configuration Panel

Tapping any product opens a Rule Configuration Panel. Rules can be set independently for Residential and Commercial zones and override shop-level defaults for that specific product.

#### Fallback Hierarchy

| **Priority** | **Source** |
|---|---|
| 1 (Highest) | Product-level saved config |
| 2 | Sub-category default |
| 3 | Shop-level default |
| 4 (Lowest) | System-wide default |

#### Section 1 — Quantity Rules

| **Field** | **Type** | **Description** |
|---|---|---|
| Min Order Quantity | Number | Minimum units per order |
| Max Order Quantity | Number | Maximum units per order |

#### Section 2 — Delivery Rules

| **Field** | **Description** |
|---|---|
| Free Delivery KM | Distance (km) up to which delivery is free |
| Per KM Price (₹) | Charge per km beyond the free limit |
| Max Delivery KM | Maximum delivery radius for this product |

#### Section 3 — Floor Charges

| **Control** | **Type** | **Behaviour** |
|---|---|---|
| Floor Charges Toggle | ON/OFF | If OFF, all floor inputs hidden. No floor charge collected. |
| Free Floor | Number | Floors up to this number have no charge |
| Per Floor Charge (₹) | Number | Charge applied per floor above the free floor limit |
| Lift Charge (₹) | Number | Separate charge when lift is available — always shown to customer |
| Is Lift Hidden Charge | Toggle | If ON, lift charge is bundled silently — **NOT PERMITTED.** Lift charge must always be visible. |

> ⚠ lift_charge must always be visible to the customer as a separate line item. is_lift_hidden_charge must not be used to suppress this.

#### Section 4 — Pricing Rules (with Bulk Discount)

| **Field** | **Behaviour** |
|---|---|
| Base Price (₹) | Unit product price |
| Bulk Discount Toggle | If ON, reveals threshold and discount % fields |
| Bulk Discount Threshold (qty) | Minimum quantity required to trigger the bulk discount (shown only if toggle ON) |
| Bulk Discount % | Discount percentage applied above threshold (shown only if toggle ON) |

**Bulk Discount MVP Logic:**
- Toggle OFF → no bulk discount applied. Standard price for all quantities.
- Toggle ON → threshold and discount % fields become visible and editable.
- If order qty ≥ threshold → discount % applied to the total for that product.
- Example: Threshold = 3, Discount = 10% → ordering 4 units triggers 10% discount on all 4 units.

#### Section 5 — Live Calculation Preview

Recalculates instantly as inputs change. Shows: Items Total, Floor Charge, Lift Charge, Delivery Charge, Bulk Discount (if applicable), Final Total. Uses example values for illustration.

> ⚠ All charges must be visible in the preview. Hidden charges are not permitted.

## 8.6 Order Management

### 8.6.1 New Order Arrival

- Shop receives push notification + in-app alert for every new order.
- Shop must Accept or Reject within configurable timeout (default: 10 minutes). Auto-reject after timeout.

### 8.6.2 Accept Flow

- Order status → Accepted.
- System auto-assigns nearest available delivery person.
- Shop owner can manually reassign to a different delivery person.
- Customer notified: 'Your order has been accepted.'

### 8.6.3 Reject Flow

- System presents customer with two separate options:
  - **Option A — Switch Shop:** system finds alternative shop. If new price is higher, customer must approve the difference. If lower, customer receives automatic refund of the difference.
  - **Option B — Refund:** order closed, full refund to original payment method (online orders). COD orders: no charge.

> ⚠ Refund and Switch options are always presented as separate, distinct choices. They are never combined.

### 8.6.4 Order Auto-Reject (Timeout)

| **Scenario** | **Log Code** | **Action** |
|---|---|---|
| Shop does not respond within timeout | ORD0001 | Order auto-rejected. Customer presented with Switch/Refund options. |
| Shop offline during order window | ORD0002 | Same as auto-reject. Shop flagged for repeated non-response. |
| Order accept network error | ORD0003 | Backend unreachable during accept — retry required. |
| Order reject network error | ORD0004 | Backend unreachable during reject — retry required. |

## 8.7 Delivery Person Management

| **Action** | **Description** |
|---|---|
| Create New Delivery Person | Enter name, phone, vehicle type, set initial PIN — shop owner communicates PIN manually to delivery person |
| First Login Detection | App detects first-time login → delivery person prompted to set their own PIN immediately |
| Reset PIN | Shop owner can reset delivery person's PIN directly from dashboard — communicated manually |
| Deactivate | Temporarily disable — cannot receive deliveries while deactivated |
| Remove | Unlink from shop. Historical delivery records retained. |

## 8.8 Customer Management

| **Status** | **Description** | **Effect** |
|---|---|---|
| Regular | Default after first successful order | Eligible for shop offers and coupons |
| Blocked | Shop owner manually blocks customer | Cannot place orders in this shop. Other shops unaffected. |

### Block/Unblock Flow

- Shop views Customer List → selects customer → taps Block.
- **Confirmation dialog:** "Block [Customer Name]? They will not be able to order from your shop."
- On confirm → customer status → Blocked. Customer notified via app.
- To unblock → select customer → tap Unblock → confirmation dialog → status restored to Regular.

## 8.9 Shop Analytics (MVP)

| **Report** | **Data Shown** | **Filters** |
|---|---|---|
| Order Summary | Total orders, accepted, rejected, cancelled | Today / This Week / This Month |
| Revenue Summary | Total revenue from completed orders | Today / This Week / This Month |
| Order Status Breakdown | Pending vs Completed vs Cancelled | Today / This Week |
| Top Selling Products | Top 5 products by order count | This Week / This Month |

---

# 9. Customer App

> ℹ There is no customer web portal. All customer functionality is delivered exclusively through the React Native mobile app.

## 9.1 Customer Home Screen

| **Element** | **Description** |
|---|---|
| Search Bar | Search by shop name, product name, or category |
| Shop Cards | Shop name, category, distance, delivery time estimate, rating, Open/Closed status |
| Active Order Banner | Shown if customer has an order in progress — taps to tracking screen |
| Loyalty Points Badge | Current points balance shown in header |
| Filter Options | Filter by: category, delivery time, shop type (residential/commercial) |

- GPS coordinates fetched on home screen load (Mapbox). If GPS denied → prompt to enter address manually.
- Shops marked 'Currently Closed' are still visible but ordering is disabled.

## 9.2 Shop Detail Page

| **Element** | **Description** |
|---|---|
| Shop Banner / Info | Name, category, rating, delivery distance, estimated delivery time |
| Product Categories | Horizontal scroll tabs for categories |
| Product Listing | Products in selected category with price, image, add to cart button |
| Active Offers Banner | Shop coupons applicable to this shop |
| Min Order Notice | Minimum order value if applicable |

### Cart Rules — One Shop Per Order

- One shop per order. If customer adds a product from a different shop, a dialog appears:
  > "Your cart has items from [Shop A]. Clear cart and switch to [Shop B]?"
- Customer must explicitly confirm cart clear before switching shops.
- Max quantity per product limited by product's max_qty setting.

## 9.3 Cart / Order Summary

| **Element** | **Description** |
|---|---|
| Cart Items | Product name, quantity selector, unit price, line total |
| Delivery Address | Customer's saved address (max 5) or option to add new |
| Floor & Delivery Preferences | Floor number, door delivery preference — saved for future orders |
| Water Can Deposit Section | Shown only for water products — deposit logic applied automatically |
| Coupon Code Field | Text input for coupon code + Apply button |
| Loyalty Points Toggle | Option to redeem points (up to 20% of bill) |
| Order Type Selection | COD or Online Payment (Razorpay) |
| Price Breakdown | Items total, floor charge, delivery charge, discount, deposit, final total |
| Minimum Order Notice | Warning if cart is below shop's minimum order value |
| Place Order Button | Disabled until all required fields complete |

### Cart Negative Scenarios

| **Scenario** | **Log Code** | **User Message** |
|---|---|---|
| Product max_qty exceeded | ORD0005 | Maximum [X] units allowed per order. |
| Cart cleared on shop switch | ORD0006 | Cart cleared. Items from [Shop A] removed. |
| Coupon invalid | CPN0001 | Invalid coupon code. |
| Coupon expired | CPN0002 | This coupon has expired. |
| Coupon not eligible for customer | CPN0003 | This coupon is not applicable to your account. |
| Loyalty points insufficient | LOY0001 | Insufficient points to redeem. |
| Loyalty points exceed 20% cap | LOY0002 | You can redeem up to ₹[X] on this order. |
| Min order value not met | ORD0007 | Minimum order value is ₹[X]. |
| COD limit reached | ORD0008 | COD not available. Please use Online Payment. |

## 9.4 Order Cancellation Flow

| **Stage** | **Cancellation Allowed** | **Refund** | **Penalty** | **Can Balance Impact** |
|---|---|---|---|---|
| Before shop accepts | Yes | 100% full refund | None | No change |
| After accept, before pickup | Yes | 100% full refund | None | No change |
| After pickup (Picked state) | Not allowed | No refund / partial only | COD LIMIT -1 if forced | No change — can not given yet |

> ⚠ Cancellation after Picked state is not permitted. If forced, order is marked 'cancelled_after_pickup' and COD limit is decremented by 1.

## 9.5 UPI Order — Tiered Refund System

When a customer cancels a UPI/Online order, the refund amount is determined by their cancellation history within the past 30 days.

| **Cancellation Count (30-day window)** | **Refund Amount** | **Warning Shown** |
|---|---|---|
| 1st cancellation | 100% refund | Warning 1/3 — full-screen modal + push notification |
| 2nd cancellation | 60% refund | Warning 2/3 — full-screen modal + push notification |
| 3rd cancellation | 10% refund | Final Warning — full-screen modal + push notification |
| 4th+ cancellation | 0% refund | No refund modal shown |

> ℹ A hidden lifetime cancellation counter is also maintained for abuse tracking. If abuse patterns are detected (high lifetime + repeated monthly misuse), COD can be disabled and stricter controls applied.

> ⚠ Tiered refund applies to UPI/Online orders ONLY. COD orders have no prepayment, so refund tiers do not apply.

## 9.6 COD Abuse Control

- System tracks failed/cancelled COD orders per customer.
- After 3 failed/cancelled COD orders → COD option is disabled for that customer.
- Customer sees prompt: 'Cash on Delivery is not available for your account. Please use Online Payment.'

## 9.7 Payment Flow

### COD Orders

- Customer selects COD → taps Place Order → order created with status: Pending.
- No in-app payment at checkout. Payment (cash or QR scan) collected at delivery only.

### Online Orders (Razorpay)

- Customer selects Online → Razorpay payment sheet opens (UPI / card / wallet).
- On payment success → order created with status: Pending.
- On payment failure → order NOT created. Customer stays on cart.

### Payment Negative Scenarios

| **Scenario** | **Log Code** | **User Message / Action** |
|---|---|---|
| Razorpay sheet fails to open | PAY0001 | Unable to open payment. Please try again. |
| Payment failed (insufficient funds) | PAY0002 | Payment failed. Please try a different method. |
| Payment timeout | PAY0003 | Payment timed out. Order not placed. |
| Duplicate order (double-tap) | PAY0004 | Order already placed. Redirecting to your orders. |
| Network drop during payment | PAY0005 | Checking payment status... Please wait. |
| Payment success but order creation fails | PAY0006 | CRITICAL — auto-refund triggered immediately. Support team notified. Customer shown: "Payment received but order failed. Refund has been initiated." |

## 9.8 Order Tracking Screen (Mapbox)

| **Status** | **Description** | **Map Shown** |
|---|---|---|
| Order Placed | Order received by system | No |
| Accepted | Shop has accepted the order | No |
| Picked | Delivery person collected from shop | Yes — delivery person location on Mapbox |
| Out for Delivery | En route to customer | Yes — live GPS tracking on Mapbox |
| Arriving Soon | Delivery person within 500m | Yes — with ETA |
| Delivered | Order handed over | No — confirmation shown |

## 9.9 Order History

| **Element** | **Description** |
|---|---|
| Order List | All past orders, newest first |
| Status Filter | All / Completed / Cancelled / Refunded |
| Order Card | Shop name, date, items summary, total, status badge |
| Reorder Button | Available on completed orders — adds same items to cart (same shop) |

## 9.10 Post-Delivery Feedback

- Prompt appears after Delivered status. Feedback is optional but earns +10 loyalty points.
- Star Rating (1–5) + optional text (max 500 chars).
- Skip → order marked 'Feedback Skipped'. No points.

## 9.11 Loyalty Points Screen

| **Element** | **Description** |
|---|---|
| Current Balance | Total available points |
| Tier Badge | Bronze / Silver / Gold / Platinum based on order count |
| Points to Next Tier | Progress bar showing orders needed to reach next tier |
| Recent History | Last 20 point events: earned / redeemed with date and order reference |
| Redemption Info | 100 points = ₹10. Max 20% of order value per order. |
| Expiry Notice | Points expire 6 months from earning date. |

## 9.12 Customer Profile & Settings

| **Setting** | **Description** |
|---|---|
| Edit Name | Update display name |
| Saved Addresses | Add / edit / delete delivery addresses (max 5) |
| Delivery Preferences | Default floor, door delivery preference |
| Notification Preferences | Enable/disable push and email notifications |
| Dark Mode Toggle | Switch between light and dark theme |
| Change PIN | Update PIN (requires current PIN verification) |
| Referral Code | Unique code to share with friends — see Section 14 |
| Logout | Clear tokens, return to phone screen |

---

# 10. Delivery Person App

## 10.1 Overview

The Delivery Person role is a dashboard within the same React Native app. Accounts are created by shop owners. First-time login triggers automatic PIN setup by the delivery person.

## 10.2 Delivery Dashboard

| **Element** | **Description** |
|---|---|
| Active Delivery | Current delivery in progress — prominently shown |
| Pending Pickups | Orders assigned but not yet picked |
| Completed Today | Count of deliveries completed today |
| Availability Toggle | ON/OFF — when OFF, no new orders auto-assigned |

## 10.3 Delivery Lifecycle

| **Status** | **Triggered By** | **Customer Notified** |
|---|---|---|
| Assigned | Shop owner assigns or auto-assigned (nearest available) | No |
| Picked | Delivery person taps 'Mark as Picked' | Yes — 'Your order has been picked up' |
| Out for Delivery | Auto-set after Picked — Mapbox navigation activated | Yes — tracking map activated |
| Arriving Soon | System — within 500m of delivery address | Yes — push notification |
| Delivered | Delivery person taps 'Mark as Delivered' + uploads live photo | Yes — 'Order delivered!' |

## 10.4 At Delivery — Actions

- App shows: customer name, floor, delivery preferences.
- For water orders: checkbox shown — 'Empty can collected?'
- Delivery person MUST upload a live photo (camera only, no gallery) showing the delivered can before marking as delivered.

> ⚠ Order cannot be marked as Delivered without uploading a live proof photo of the delivered can.

## 10.5 Customer No-Response Protocol

| **Step** | **Action** |
|---|---|
| 1 | Call customer (1st attempt) — log call in app |
| 2 | Call customer (2nd attempt) — log call in app |
| 3 | 10-minute timer starts automatically after 2nd call is logged |
| 4 | After 10 minutes with no response → system auto-closes order, marks as 'failed_delivery' |

> ℹ Combined flow: delivery person must make 2 logged calls AND wait 10 minutes after the 2nd call before the system auto-closes. Manual "Mark No Response" is replaced by the 10-minute auto-close timer.

| **Occurrence** | **Penalty** |
|---|---|
| First time | Warning shown to customer. No COD score change. |
| Repeat offence | COD Limit -1 per occurrence |
| Severe / repeated pattern | COD Limit -2 (admin reviewable) |

## 10.6 Extra Charge Request Flow

- Delivery person taps 'Raise Change Request' → selects reason (floor changed / distance changed).
- System sends in-app approval request to customer.
- Customer Approves → charge added → delivery proceeds.
- Customer Declines or no response (5 min) → no extra charge. Delivery proceeds without extra charge.
- If customer declines: partial refund (delivery charge deducted) is applied.

> ⚠ No approval = No charge. Delivery person cannot manually collect any extra amount outside the in-app approval flow.

## 10.7 Delivery Log Codes

| **Log Code** | **Event** | **Severity** |
|---|---|---|
| DEL0001 | Mark Picked — network error | ERROR |
| DEL0002 | Mark Delivered — no photo uploaded | INFO |
| DEL0003 | Delivery photo upload failed | ERROR |
| DEL0004 | Extra charge request submitted | INFO |
| DEL0005 | Customer approved extra charge | INFO |
| DEL0006 | Customer declined extra charge | INFO |
| DEL0007 | No response — auto-close triggered | WARN |
| DEL0008 | Empty can collected | INFO |
| DEL0009 | Empty can not collected — deposit added | WARN |
| DEL0010 | GPS tracking failed (Mapbox) | ERROR |
| DEL0011 | Availability toggle OFF during active delivery | WARN |

---

# 11. Water Can & Deposit System

## 11.1 Overview

The water can system manages deposit charges, empty can tracking, and refill pricing. All products carry an is_water flag. Water products trigger deposit logic. Normal products skip it entirely.

## 11.2 Deposit Logic

| **Customer Can Balance** | **Deposit Charged** | **Balance After Order** |
|---|---|---|
| 0 (new customer or no can) | Yes — deposit + water price | Balance +1 (new can issued) |
| > 0 (has empty can to return) | No — water price only | Balance -1 (can returned at delivery) |
| > 0 but does not return can | Deposit auto-added at delivery | Balance unchanged |

> ℹ Balance tracked independently per can size: 20L and 10L. Formula: balance = total_cans_given − total_empty_returned. Balance can never go below zero.

## 11.3 Smart Auto-Detection at Checkout

- Customer adds water product to cart → system checks user's can balance for that can size.
- If balance > 0 → deposit = ₹0 (or hidden with label 'Empty can on hand').
- If balance = 0 → deposit amount added to order total.
- Price breakdown updated in real-time on cart screen.

## 11.4 Delivery Side — Empty Can Collection

| **Scenario** | **App Action** | **Balance Impact** |
|---|---|---|
| Empty can present and collected | Check 'Empty collected' checkbox | Customer balance -1 |
| Empty can not present | Leave unchecked | No balance change. Deposit auto-added to order. |
| Customer claimed can but not there | Select 'Empty not collected' | Deposit added. Customer notified. Balance unchanged. |

> ⚠ The delivery person's app action is the source of truth for empty can collection. Customer's claim at order time is not binding.

## 11.5 Water Can Log Codes

| **Log Code** | **Event** | **Severity** |
|---|---|---|
| CAN0001 | Balance check failed | ERROR |
| CAN0002 | Balance went below zero — prevented | ERROR |
| CAN0003 | Deposit auto-added — can not returned | INFO |
| CAN0004 | Deposit incorrectly not charged | ERROR |

---

# 12. Coupon System

## 12.1 Coupon Types

| **Type** | **Created By** | **Discount Borne By** | **Visibility** |
|---|---|---|---|
| Platform Coupon | Admin | Platform (shop gets full amount) | All customers or targeted |
| Shop Coupon | Shop Owner | Shop (shop gets reduced amount) | Within that shop only |

## 12.2 Coupon Creation Fields

| **Field** | **Required** | **Validation** |
|---|---|---|
| Coupon Code | Yes | Alphanumeric, 4–20 chars, unique in system |
| Discount Type | Yes | Fixed (₹) or Percentage (%) |
| Discount Value | Yes | Positive number; percentage max 100 |
| Expiry Date | Yes | Must be a future date |
| Usage Limit | No | Integer ≥ 1 if set; null = unlimited |
| Customer Target | Yes | All Customers / Selected Customers / Individual Customer |

## 12.3 Discount Settlement Rules

| **Coupon Type** | **Customer Pays** | **Shop Receives** | **Platform Absorbs** |
|---|---|---|---|
| Platform (Admin) Coupon | Order total − discount | Full original order total | Discount amount |
| Shop Coupon | Order total − discount | Order total − discount | Nothing |

## 12.4 Coupon Log Codes

| **Log Code** | **Event** | **Severity** |
|---|---|---|
| CPN0001 | Invalid coupon code | INFO |
| CPN0002 | Coupon expired | INFO |
| CPN0003 | Customer not eligible | INFO |
| CPN0004 | Usage limit exceeded | INFO |
| CPN0005 | Coupon creation — duplicate code | WARN |
| CPN0006 | Coupon creation failed | ERROR |
| CPN0007 | Settlement calculation error | CRITICAL |

---

# 13. Loyalty Points System

## 13.1 Points Earning Events

| **Event** | **Points Earned** |
|---|---|
| ₹100 spent on an order | +10 points |
| 1 can / item purchased | +2 points |
| First completed order bonus | +50 points (credited on first successful delivery) |
| Referral — referred friend completes first order | +100 points to referrer |
| Festival / campaign offer | 2× multiplier on all earning |
| Feedback submitted | +10 points |

## 13.2 Points Redemption Rules

| **Rule** | **Detail** |
|---|---|
| Redemption rate | 100 points = ₹10 |
| Max usage per order | Up to 20% of bill value |
| Points expiry | 6 months from the date of earning (fixed) |

## 13.3 Tier / Badge System

| **Tier** | **Criteria** | **Points Multiplier** |
|---|---|---|
| Bronze | Default (all new users) | 1× |
| Silver | 10 completed orders | 1.2× |
| Gold | 25 completed orders | 1.5× |
| Platinum | 50+ completed orders | 2× |

## 13.4 Points Handling on Cancellation / Refund

| **Scenario** | **Points Rule** |
|---|---|
| Order Cancelled | Points used → returned to customer. Points earned → not granted. |
| Order Refunded | Points earned → deducted. Points used → restored. |

---

# 14. Referral System

## 14.1 Overview

Every customer gets a unique referral code visible in their profile. Sharing this code with friends rewards both parties once the referred friend completes their first order.

## 14.2 Referral Rewards

| **Party** | **Reward** | **Credit Timing** |
|---|---|---|
| Referrer (existing customer) | +100 loyalty points | After referred friend completes their first order |
| Referred friend (new customer) | +50 loyalty points | After their own first order is completed |

## 14.3 Referral Flow

- Customer shares their unique referral code with a friend.
- Friend downloads the app and enters referral code during or after registration.
- Friend places and completes their first order (paid + delivered).
- System credits +100 points to the referrer and +50 points to the friend simultaneously.
- Both parties receive a push notification confirming points credited.

## 14.4 Referral Rules

- Referral code can only be entered once per new account. It cannot be changed after submission.
- A referral is only valid if the referred friend is a genuinely new user (phone number not previously registered).
- Points are credited only after the first order is fully completed (not just placed or accepted).
- Self-referral is not permitted — a user cannot use their own referral code.

## 14.5 Referral Log Codes

| **Log Code** | **Event** | **Severity** |
|---|---|---|
| REF0001 | Referral code applied successfully | INFO |
| REF0002 | Invalid referral code entered | INFO |
| REF0003 | Self-referral attempt blocked | WARN |
| REF0004 | Referral points credited to referrer | INFO |
| REF0005 | Referral points credited to referee | INFO |
| REF0006 | Referral points credit failed | ERROR |

---

# 15. Customer Management (Shop Side)

## 15.1 Overview

After a customer places their first order with a shop, they appear in that shop's Customer List. The shop can manage their status and assign targeted coupons.

## 15.2 Customer Statuses

| **Status** | **Description** | **Effect** |
|---|---|---|
| Regular | Default after first successful order | Eligible for shop offers and coupons |
| Blocked | Shop owner manually blocks customer | Cannot place orders in this shop. Other shops unaffected. |

## 15.3 Block/Unblock Flow

- Shop views Customer List → selects customer → taps Block.
- **Confirmation dialog:** "Block [Customer Name]? They will not be able to order from your shop."
- On confirm → customer status → Blocked. Customer notified via app.
- To unblock → select customer → tap Unblock → confirmation dialog → status restored to Regular.

## 15.4 Regular Customer Coupon Assignment

Shop owner can select one or multiple Regular customers and assign a shop coupon directly from the Customer List screen. This connects to the Coupon Creation flow (Section 12) using the 'Selected Customers' target option.

## 15.5 Customer Management Log Codes

| **Log Code** | **Event** | **Severity** |
|---|---|---|
| CUST0001 | Customer blocked | INFO |
| CUST0002 | Customer unblocked | INFO |
| CUST0003 | Blocked customer order attempt | WARN |
| CUST0004 | Customer list load error | ERROR |

---

# 16. Complaints System (MVP — Minimal)

## 16.1 Overview

A minimal complaint/dispute system is included in MVP. All roles can raise complaints. Admin is the sole resolver of all complaints.

## 16.2 Who Can Raise Complaints

| **Role** | **Can Raise Complaint** | **Example Use Case** |
|---|---|---|
| Customer | Yes | Wrong item delivered, delivery not received, overcharge |
| Shop Owner | Yes | False delivery claim, customer abuse, payment dispute |
| Delivery Person | Yes | Customer abuse, unsafe delivery location, incorrect address |

## 16.3 Complaint Flow

- Any role taps 'Raise Complaint' and selects a category.
- Complaint form: category, description (min 20 chars), optional photo attachment.
- Complaint submitted → Admin receives push + email notification.
- Admin reviews complaint → takes action → marks as Resolved with resolution note.
- Complainant notified via push + email when complaint is resolved.

## 16.4 Complaint Statuses

| **Status** | **Description** |
|---|---|
| Open | Newly submitted, awaiting admin review |
| In Review | Admin has opened and is reviewing the complaint |
| Resolved | Admin has taken action and closed the complaint |

## 16.5 Complaint Log Codes

| **Log Code** | **Event** | **Severity** |
|---|---|---|
| COMP0001 | Complaint submitted | INFO |
| COMP0002 | Complaint notification to admin failed | ERROR |
| COMP0003 | Complaint marked In Review | INFO |
| COMP0004 | Complaint resolved by admin | INFO |
| COMP0005 | Resolution notification failed | ERROR |

---

# 17. Notification System

## 17.1 Notification Events

| **Event** | **Recipient** | **Channel** | **Message** |
|---|---|---|---|
| OTP sent | User | Brevo Email (primary), MSG91 SMS (fallback) | Your OTP is [XXXXXX]. Valid for 5 minutes. |
| Shop approved | Shop Owner | Push + Brevo Email | Your shop [Name] has been approved! |
| Shop step rejected | Shop Owner | Push + Brevo Email | Step [X] needs correction. Reason: [remark] |
| New order received | Shop Owner | Push | New order #[ID] received. ₹[amount]. |
| Order accepted | Customer | Push | Your order has been accepted by [Shop Name]. |
| Order rejected | Customer | Push | Your order was rejected. Choose: Switch Shop or Refund. |
| Order picked | Customer | Push | Your order has been picked up and is on the way! |
| Arriving soon | Customer | Push | Your delivery is arriving in ~5 minutes. |
| Order delivered | Customer | Push + Brevo Email | Your order has been delivered. Rate your experience. |
| Extra charge request | Customer | Push + In-app | Extra charge of ₹[X] due to [reason]. Approve? |
| No response penalty | Customer | Push | We were unable to deliver your order. Warning issued. |
| UPI cancellation warning | Customer | Push + Full-screen modal | Warning [X/3] used. Refund: [Y]%. |
| COD disabled | Customer | Push | Your COD access has been disabled due to repeated failures. |
| Refund initiated | Customer | Push + Brevo Email | Refund of ₹[X] initiated. ETA 3–5 business days. |
| Referral points credited | Customer (both) | Push | +[X] loyalty points added from referral! |
| New coupon assigned | Customer | Push | You have a new coupon! Code: [CODE]. Valid till [date]. |
| Points credited | Customer | Push | +[X] loyalty points added to your account. |
| Complaint resolved | Complainant | Push + Brevo Email | Your complaint has been resolved. View details. |
| New shop application (to Admin) | Admin | Push + Brevo Email | New shop application from [Shop Name]. Review now. |

## 17.2 Notification Log Codes

| **Log Code** | **Event** | **Severity** |
|---|---|---|
| NOTIF0001 | Push notification failed | ERROR |
| NOTIF0002 | Email send failed | ERROR |
| NOTIF0003 | SMS OTP failed | ERROR |
| NOTIF0004 | Both OTP channels failed | CRITICAL |

---

# 18. API Design & Backend

## 18.1 Stack

| **Component** | **Technology** |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| ORM | Sequelize |
| Database | MySQL |
| Real-time | Socket.io (WebSocket) |
| File Storage | Hetzner Server (self-managed VM) |
| API Versioning | /api/v1/... (all endpoints versioned) |

## 18.2 API Design Principles

- RESTful API design. JSON request and response bodies.
- All endpoints require `Authorization: Bearer JWT token`, except: `POST /auth/check-phone`, `POST /auth/verify-otp`, `POST /auth/login`.
- Standard HTTP status codes: 200, 201, 400, 401, 403, 404, 422, 429, 500.
- All error responses include: `{ error_code, message, timestamp }`.
- Order placement uses idempotency key (client-generated UUID) to prevent duplicate orders.

## 18.3 Idempotency Rules

- **Order placement:** client sends a UUID idempotency key with every place-order request. Duplicate requests with the same key within 10 minutes return the same order ID without creating a new order.
- **Payment verification:** the payment verification endpoint is idempotent — repeated calls with the same Razorpay order ID return the same result without re-processing. This prevents double-charge on retry after network drop.

## 18.4 Route Module Map

| **Module** | **Base Path** | **Key Endpoints** |
|---|---|---|
| Auth | /api/v1/auth | POST /check-phone, POST /login, POST /send-otp, POST /verify-otp, POST /reset-pin |
| Users | /api/v1/users | GET /me, PUT /me, GET /addresses, POST /addresses |
| Onboarding | /api/v1/onboarding | Shop onboarding steps 1–4 |
| Shops | /api/v1/shops | GET / (list), GET /:id, POST / (create), PUT /:id, GET /:id/products |
| Products | /api/v1/products | GET /, POST /, PUT /:id, DELETE /:id, GET /settings/:id, POST /settings/:id |
| Orders | /api/v1/orders | POST / (place), GET / (list), GET /:id, PUT /:id/accept, PUT /:id/reject, PUT /:id/status, PUT /:id/cancel |
| Delivery | /api/v1/delivery | GET /assigned, PUT /:id/picked, PUT /:id/delivered, POST /:id/change-request |
| Payments | /api/v1/payments | POST /initiate, POST /verify, POST /refund |
| Loyalty | /api/v1/loyalty | GET /balance, GET /history, POST /redeem |
| Coupons | /api/v1/coupons | POST / (create), GET /, POST /validate, POST /apply |
| Cans | /api/v1/cans | GET /balance, PUT /balance |
| Customers (Shop) | /api/v1/shop/customers | GET /, PUT /:id/block, PUT /:id/unblock |
| Referrals | /api/v1/referrals | POST /apply, GET /status |
| Complaints | /api/v1/complaints | POST / (raise), GET /, PUT /:id/resolve |
| Admin | /api/v1/admin | GET /shops/pending, PUT /shops/:id/review, POST /coupons, GET /settings, PUT /settings |
| Upload | /api/v1/upload | Shared file upload utility |
| System | /api/v1/system | System-wide settings (admin-managed) |

## 18.5 Real-time Communication

- Socket.io handles: live GPS tracking updates, order status push events, extra charge approval requests.
- GPS tracking refresh interval: ≤ 5 seconds.
- Fallback: if Socket.io connection drops, client falls back to polling at 5-second intervals.
- Firebase FCM (Android) + APNs (iOS) handle push notifications for background/killed app state.

---

# 19. Key Data Flags & Fields

## 19.1 Order Fields

| **Field** | **Type** | **Description** |
|---|---|---|
| order_type | enum: cash / upi | Payment method selected by customer |
| refund_stage | integer (1–4) | UPI cancellation tier (within 30-day window) |
| cod_blocked | boolean | Whether COD is disabled for this customer |
| delivery_status | enum | pending / picked / out_for_delivery / delivered / failed_delivery / cancelled_after_pickup |
| auto_closed | boolean | True if order was auto-closed due to no-response timeout |
| extra_charge | decimal | Extra charge amount approved by customer (floor/distance change) |
| proof_image | string (URL) | Hetzner URL of delivery proof photo |
| is_water | boolean | Whether order contains water can products |
| deposit_charged | boolean | Whether deposit was charged on this order |
| deposit_reason | string | Reason deposit was charged (new_customer / no_empty_return) |

## 19.2 User Fields

| **Field** | **Type** | **Description** |
|---|---|---|
| cancellation_count_30d | integer | UPI cancellations in last 30 days (refund tier tracker) |
| lifetime_cancellations | integer | Hidden lifetime counter for abuse detection |
| cod_failed_count | integer | Count of failed/cancelled COD orders |
| cod_blocked | boolean | True if COD is disabled after 3 COD failures |
| referral_code | string | Unique referral code for this customer |
| referred_by | string (nullable) | Referral code used during registration |
| first_login | boolean | True if delivery person has not yet set their own PIN |

---

# 20. Phase 2 Features (Deferred)

The following features are designed and documented for context but are NOT part of MVP scope.

| **Feature** | **Module** | **Description** |
|---|---|---|
| Shop Owner Payout | Payout | Shop wallet balance, payout requests, settlement reports |
| Support Tickets | Support | Formal support ticket system for customer + admin |
| Order Splitting | Orders / Delivery | Split one order across multiple delivery persons |
| QR Code on Can | Water Can | Individual can lifecycle tracking via QR scan |
| Deposit Wallet | Water Can | Deposit stored as wallet balance, redeemable across orders |
| Lost Can Penalty | Water Can | Auto-penalty if can not returned after configurable days |
| Auto-apply Coupons | Coupons | System auto-applies best eligible coupon at checkout |
| Coupon Usage History | Coupons | Track which customer used which coupon, when, on which order |
| Shop-wise Loyalty Tiers | Loyalty | Shop-specific discount tiers and level-based stacking |
| Admin-configurable Settings UI | System | Admin can change system settings values via UI (currently backend-only) |
| Multi-city Support | Platform | city_id column already in schema — activation deferred |
| Multi-language Support | Platform | Tamil and other languages for Chennai market |
| COD Cooldown / Stricter Controls | Orders | Cooldown period + stricter rules for lifetime abuse patterns |

---

# Appendix A — Document Change Log

| **Version** | **Changes** |
|---|---|
| PRD v1.0 | Initial draft — based on OpenSpec v2.6 |
| PRD v2.0 | Major update: App name → ThanniGo. Removed web portal entirely. Admin moved to React Native app (same codebase). Mapbox replaces Google Maps. Brevo replaces SendGrid/AWS SES. MSG91 replaces Twilio. Node.js + Express + Sequelize added to stack. Socket.io replaces Firebase for real-time. Hetzner replaces AWS S3 for storage. Delivery person PIN flow updated (no SMS, first-login detection, shop owner reset). COD abuse rule simplified (block after 3 failures). Tiered UPI refund system added (30-day window + lifetime counter). Combined no-response protocol (2 calls + 10-min timer). Switch shop price-lower refund added. Extra charge decline = partial refund. Complaints system added to MVP. Referral system fully documented. Shop open/close toggle added. Customer cancellation flow fully documented. Admin dashboard expanded with 5 new tracking cards. System settings documented under Admin. Max 5 saved addresses. Auto-assignment (nearest) + manual reassign. Payout and Support deferred to Phase 2. |
| PRD v2.0 (Updated) | Gap fill from v1.0: Stakeholders table added. SYS0001 force update screen added. Full AUTH error codes restored (AUTH0007–AUTH0013, AUTH0018, AUTH0019). Customer registration negative scenarios added (USER0001–USER0007). Shop onboarding negative scenarios added (SHOP0001–SHOP0018). Product/category negative scenarios added (PROD0001–PROD0010). Order negative scenarios added (ORD0001–ORD0008). Payment negative scenarios added (PAY0001–PAY0006) including critical PAY0006 auto-refund. Cart rule — one shop per order dialog documented. Admin log codes ADMIN0005–ADMIN0007 added. Admin shop list filters and table columns added. Coupon log codes CPN0004–CPN0007 added. Customer management log codes CUST0001–CUST0004 added. Notification log codes NOTIF0001–NOTIF0004 added. CAN0001–CAN0004 log codes added. Block/unblock confirmation dialog text added. Order history status filter added. Loyalty points screen full content added (progress bar, recent history, redemption info, expiry notice). Product rule panel fully detailed — all 5 sections with updated fields (Quantity, Delivery, Floor, Pricing with Bulk Discount MVP, Live Calculation Preview). Bulk discount MVP added (toggle + threshold + %). Reliability & Availability section added (99.5% uptime, graceful degradation, PAY0006 rollback). Payment idempotency rule documented. No-response protocol clarified (2 calls + 10-min auto-close combined flow). |

---

*Chennai MVP — May 2026 | ThanniGo CONFIDENTIAL*