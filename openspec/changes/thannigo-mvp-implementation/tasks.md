## 1. Database — Breaking Migration: Water Can Model

- [ ] 1.1 Create `customer_can_balance` table with columns: `id`, `user_id`, `can_size` (ENUM: 20L/10L), `total_cans_given` (INT default 0), `total_cans_returned` (INT default 0), `pending_cans` (INT generated as total_cans_given − total_cans_returned), `customer_deposit_balance` (DECIMAL default 0), unique constraint on `(user_id, can_size)`
- [ ] 1.2 Write migration script: seed `customer_can_balance` rows from existing `user_can_balance` data (20L row gets existing cans_given/cans_returned; 10L row seeded at zero)
- [ ] 1.3 Rename existing `user_can_balance` table to `user_can_balance_archive` after verifying migration

## 2. Database — User Table Extensions

- [ ] 2.1 Add `cancellation_count_30d` (INT default 0), `lifetime_cancellations` (INT default 0) to `users`
- [ ] 2.2 Add `cod_failed_count` (INT default 0), `cod_trust_score` (INT default 5), `cod_blocked` (BOOLEAN default false), `successful_cod_deliveries` (INT default 0) to `users`
- [ ] 2.3 Add `first_login` (BOOLEAN default false) to `users`

## 3. Database — Order Table Extensions

- [ ] 3.1 Add `deposit_reason` (VARCHAR nullable), `deposit_refunded` (BOOLEAN default false), `return_confirmed_at` (TIMESTAMP nullable), `force_closed_by_admin` (BOOLEAN default false) to `orders`
- [ ] 3.2 Extend `delivery_status` enum to include `return_to_shop` (alongside existing values)
- [ ] 3.3 Verify `proof_image` (VARCHAR URL) column exists on `orders`; add if missing

## 4. Database — System Settings for Platform Config

- [ ] 4.1 Insert System Setting rows: `deposit_20l` (value: 200), `deposit_10l` (value: 100) if not already present
- [ ] 4.2 Insert System Setting rows: `pending_can_warning_threshold` (2), `pending_can_block_threshold` (3), `return_confirmation_timeout_minutes` (60), `no_response_wait_time_minutes` (10), `no_response_call_attempts` (2) if not present
- [ ] 4.3 Verify all 17 System Settings from PRD section 7.5 have rows in `system_settings`; add missing ones with default values

## 5. Backend — Water Can Service (CanService rewrite)

- [ ] 5.1 Create/rewrite `CanService` to read from `customer_can_balance` (per can size) instead of `user_can_balance`
- [ ] 5.2 Implement `getCanBalance(userId, canSize)` → returns `{total_cans_given, total_cans_returned, pending_cans, customer_deposit_balance}`
- [ ] 5.3 Implement `checkoutDepositLogic(userId, canSize, orderId)` → reads `pending_cans` and platform deposit rate from System Settings; returns deposit amount to charge or 0
- [ ] 5.4 Implement `applyDepositRefund(userId, canSize, orderId)` → calculates refund amount on can return; applies as discount to order; stores excess in `customer_deposit_balance`
- [ ] 5.5 Implement `incrementCansGiven(userId, canSize, quantity)` and `incrementCansReturned(userId, canSize, quantity)` with balance-below-zero guard (log CAN0002)
- [ ] 5.6 Update `GET /api/v1/cans/balance` to return per-size array; remove old single-balance endpoint

## 6. Backend — Authentication

- [ ] 6.1 Implement `POST /api/v1/auth/check-phone` — returns `{exists: bool, role?}` for phone number; apply rate limiting (5 OTP requests per phone per hour)
- [ ] 6.2 Implement `POST /api/v1/auth/login` — validates 4-digit PIN via bcrypt, tracks attempt count; locks account after 3 failures; issues JWT access token (15 min) + refresh token (30 days)
- [ ] 6.3 Implement `POST /api/v1/auth/send-otp` — sends OTP via Brevo email; falls back to MSG91 after 30 seconds; enforces 5-minute OTP validity and 3-attempt cooldown
- [ ] 6.4 Implement `POST /api/v1/auth/verify-otp` — validates OTP, handles expiry and max-attempt lockout
- [ ] 6.5 Implement `POST /api/v1/auth/reset-pin` — validates new PIN strength (no sequential/repeated), hashes and stores, resets lockout counter, auto-logs in
- [ ] 6.6 Implement JWT refresh endpoint; implement force-update version check on app launch (return minimum version from System Settings)

## 7. Backend — User Registration and Onboarding

- [ ] 7.1 Implement customer self-registration: `POST /api/v1/auth/register` — validates name (2–60 chars, letters+spaces) and PIN; creates user + customer records; issues JWT
- [ ] 7.2 Implement shop onboarding Step 1 endpoint: validates all fields including GST format, unique shop email, alternate phone uniqueness
- [ ] 7.3 Implement shop onboarding Step 2 endpoint: handles multi-file upload to Hetzner (live photos camera-only, documents up to 5MB JPEG/PNG/PDF)
- [ ] 7.4 Implement shop onboarding Steps 3 and 4 endpoints: IFSC validation, UPI format validation, GPS coordinates capture and save
- [ ] 7.5 Implement delivery person creation by shop owner: `POST /api/v1/shop-owner/delivery-persons` — sets `first_login = true`; no OTP/SMS sent
- [ ] 7.6 Implement delivery person first-login PIN reset detection: on login with `first_login = true`, return a flag forcing PIN setup before routing to dashboard

## 8. Backend — Admin Portal

- [ ] 8.1 Implement admin dashboard stats endpoint: `GET /api/v1/admin/dashboard` returning counts for all 9 cards (pending applications, re-submissions, approved shops, active coupons, open complaints, refund abuse users, COD blocked users, failed deliveries, shop rejection %)
- [ ] 8.2 Implement shop list endpoint with filters: `GET /api/v1/admin/shops` with query params for status, category, date range, search
- [ ] 8.3 Implement step-wise shop approval: `PUT /api/v1/admin/shops/:id/steps/:step/approve` and `/reject` — rejection requires `remark` (min 10 chars); on full approval set shop status to Approved and trigger notification
- [ ] 8.4 Implement System Settings CRUD: `GET /api/v1/admin/settings` and `PUT /api/v1/admin/settings/:key` — admin-only access
- [ ] 8.5 Implement admin platform coupon creation: `POST /api/v1/admin/coupons` with `issuer_type: admin`; validate code uniqueness and future expiry
- [ ] 8.6 Implement complaint queue endpoints: `GET /api/v1/admin/complaints` (filter by status), `PATCH /api/v1/admin/complaints/:id/status`, `PUT /api/v1/admin/complaints/:id/resolve` with resolution note

## 9. Backend — Shop Owner Portal

- [ ] 9.1 Implement shop open/close toggle: `PATCH /api/v1/shop-owner/shop/status` — updates shop open/closed state
- [ ] 9.2 Implement shop settings configuration endpoints (post-approval): min order value, delivery radius and pricing, floor charges, instant delivery toggle per zone
- [ ] 9.3 Implement category and subcategory CRUD with uniqueness validation (PROD0001, PROD0002, PROD0003 error codes)
- [ ] 9.4 Implement product CRUD: `is_water` flag, `can_size` field, deposit amount as read-only display from System Settings; validate all product fields per spec
- [ ] 9.5 Implement Product Rule Configuration Panel API: endpoint to save per-product rules (quantity, delivery, floor charges, bulk discount) with 4-level fallback hierarchy
- [ ] 9.6 Implement order accept endpoint with delivery person auto-assignment (nearest available) and manual reassignment: `PUT /api/v1/shop-owner/orders/:id/accept`
- [ ] 9.7 Implement order reject endpoint: `PUT /api/v1/shop-owner/orders/:id/reject` — triggers switch-shop/refund resolution flow for customer
- [ ] 9.8 Implement auto-reject timeout job: BullMQ job scheduled at order placement; fires after `order_accept_timeout` system setting; logs ORD0001, triggers switch/refund resolution
- [ ] 9.9 Implement shop owner analytics endpoints: order summary, revenue summary, order status breakdown, top 5 products — all with Today/This Week/This Month filters
- [ ] 9.10 Implement delivery person management endpoints: deactivate, remove (retain history), reset PIN
- [ ] 9.11 Implement shop customer block/unblock endpoints and enforcement in order placement validation (log CUST0003 on blocked customer order attempt)

## 10. Backend — Order Lifecycle

- [ ] 10.1 Implement order placement endpoint `POST /api/v1/orders` with: idempotency key validation, pending_cans block check, COD block check, min order value check, deposit logic, loyalty points redemption, coupon application, price breakdown calculation
- [ ] 10.2 Implement order cancellation endpoint with before/after pickup logic: `PUT /api/v1/orders/:id/cancel` — before Picked = 100% refund no tier; after Picked = read live 30d count from `order_status_logs` for tier, increment counters, trigger deposit separate refund
- [ ] 10.3 Implement UPI tiered refund calculation: read `cancellation_count_30d` from live 30d query; apply correct tier percentage (100%/60%/10%/0%); initiate Razorpay refund for order total portion; initiate separate full refund for deposit
- [ ] 10.4 Implement cancel-after-pickup return-to-shop flow: set `return_to_shop` status, notify delivery person in-app, start 60-min shop confirmation timer
- [ ] 10.5 Implement return confirmation endpoint: `PUT /api/v1/orders/:id/confirm-return` (shop owner); set `return_confirmed_at`, status → `closed`
- [ ] 10.6 Implement Admin force-close endpoint for unconfirmed returns: `PUT /api/v1/admin/orders/:id/force-close`; set `force_closed_by_admin = true`; notify all 3 parties
- [ ] 10.7 Implement nightly cron to refresh `cancellation_count_30d` from `order_status_logs` for all customers

## 11. Backend — Delivery Lifecycle

- [ ] 11.1 Implement delivery person status update endpoints: `PUT /api/v1/delivery/:id/picked`, `/out-for-delivery`, `/delivering`
- [ ] 11.2 Implement `PUT /api/v1/delivery/:id/delivered` — requires `proof_image` upload to Hetzner; validates photo present; updates `total_cans_given` if water order; applies can return deposit refund if `empty_can_collected = true`
- [ ] 11.3 Implement no-response protocol: call logging endpoint, automatic 10-min timer start after 2nd logged call, auto-close to `failed_delivery`, trigger return-to-shop flow
- [ ] 11.4 Implement extra charge request: `POST /api/v1/delivery/:id/change-request` — sends in-app approval to customer with 5-min timeout; customer approve/decline endpoints; deliver at original amount if declined or timeout
- [ ] 11.5 Implement COD control updates: on cancel-after-pickup increment `cod_failed_count`, decrement `cod_trust_score`; on failed delivery (customer fault) increment `cod_failed_count`; on 5 successful COD deliveries increment `cod_trust_score` and reset `successful_cod_deliveries`; set `cod_blocked = true` when either threshold reached
- [ ] 11.6 Implement Arriving Soon trigger: Socket.io proximity check (500m) during GPS update; emit `arriving_soon` event; push notification to customer

## 12. Backend — Switch Shop Flow

- [ ] 12.1 Implement switch shop suggestion endpoint: `GET /api/v1/orders/:id/switch-suggestions` — find nearest available shop with all ordered items; sort by proximity + cheapest tiebreaker
- [ ] 12.2 Implement switch shop confirmation endpoint: `POST /api/v1/orders/:id/switch-shop` — handle price diff (higher: require approval, lower UPI: auto-refund, lower COD: new amount at delivery)
- [ ] 12.3 Ensure switch-shop refunds do NOT increment `cancellation_count_30d` or `cod_failed_count`

## 13. Backend — Loyalty and Referral

- [ ] 13.1 Implement loyalty point earning events as BullMQ async jobs: spend-based (10pts per ₹100), per-can (2pts), first-order bonus (50pts), feedback (10pts) — with tier multiplier applied
- [ ] 13.2 Implement loyalty redemption at checkout: validate 100pts = ₹10, cap at 20% of order value, decrement balance on order placement
- [ ] 13.3 Implement loyalty tier upgrade: check completed order count at delivery confirmation; upgrade tier if threshold met (10/25/50 orders)
- [ ] 13.4 Implement 6-month point expiry: nightly cron expires points where `earned_at` + 6 months <= now
- [ ] 13.5 Implement loyalty point reversal on cancellation/refund: return redeemed points; cancel earned-but-not-yet-credited points
- [ ] 13.6 Implement referral code generation on customer registration (unique code)
- [ ] 13.7 Implement referral code application endpoint: validate code exists, not self-referral, not already used; link referral record
- [ ] 13.8 Implement referral reward disbursement on first completed order: credit 100pts to referrer and 50pts to referee; notify both via push

## 14. Backend — Notification Service

- [ ] 14.1 Create centralized `NotificationService` with `send(event, recipients, data)` interface; enqueue BullMQ jobs for push (FCM/APNs), email (Brevo), or SMS (MSG91)
- [ ] 14.2 Implement FCM/APNs push worker; handle token lookup from `push_tokens` table
- [ ] 14.3 Implement Brevo email worker for transactional emails (OTP, shop approval/rejection, delivery confirmation, refund initiated, complaint resolved, new shop application)
- [ ] 14.4 Wire all 20+ notification events from PRD section 17 to `NotificationService` in their respective backend services
- [ ] 14.5 Log NOTIF0001/0002/0003/0004 on delivery failures; do not reverse business operations on notification failure

## 15. Frontend — Authentication Screens

- [ ] 15.1 Implement app launch session check: JWT valid → role dashboard; refresh token valid → silent refresh → dashboard; neither valid → Phone Number screen
- [ ] 15.2 Implement force-update gate screen: check app version vs backend minimum; block all interaction if below minimum with store link
- [ ] 15.3 Implement Phone Number Entry screen: +91 fixed, 10-digit validation (client-side), API call to check-phone, route to PIN Entry or Role Selection
- [ ] 15.4 Implement PIN Entry screen: 4-digit masked input, attempt counter display, lockout state handling, Forgot PIN link
- [ ] 15.5 Implement Forgot PIN OTP screen: 6-digit input, 5-minute validity, resend (3x, 30s cooldown), error states for wrong/expired/max-attempts OTP
- [ ] 15.6 Implement Set New PIN screen: strength validation (no sequential/repeated), confirm field, submit
- [ ] 15.7 Implement role-based routing: inspect JWT role post-login and navigate to Customer Home, Shop Dashboard, Delivery Dashboard, or Admin Dashboard

## 16. Frontend — User Onboarding Screens

- [ ] 16.1 Implement Role Selection screen with Customer and Shop Owner options (no self-registration for Delivery Person or Admin)
- [ ] 16.2 Implement Customer Registration screen: name field validation, PIN + Confirm PIN, submit
- [ ] 16.3 Implement Shop Onboarding Step 1 screen: all basic detail fields with validation
- [ ] 16.4 Implement Shop Onboarding Step 2 screen: camera-only live photos (shop + owner), document upload (Aadhaar front/back, PAN) with file type and size validation
- [ ] 16.5 Implement Shop Onboarding Step 3 screen: bank details form with IFSC and UPI validation
- [ ] 16.6 Implement Shop Onboarding Step 4 screen: Mapbox GPS capture, pin confirmation, GPS error states
- [ ] 16.7 Implement Waitlist/Status screen: Under Review, Pending Re-submission (with edit access to rejected step only), Approved redirect

## 17. Frontend — Admin Portal Screens

- [ ] 17.1 Implement Admin Dashboard: 9 stat cards with navigation to respective management screens
- [ ] 17.2 Implement Shop List screen with status filter, category filter, date range, and search; tabular view with shop data and Review action
- [ ] 17.3 Implement Step-wise Shop Approval screen: tabbed layout (4 steps), approve/reject per step, mandatory rejection remark field (min 10 chars), full approval notification confirmation
- [ ] 17.4 Implement System Settings management screen: editable list of all 17 platform settings with type-appropriate inputs
- [ ] 17.5 Implement Admin Coupon Creation screen: code, discount type/value, expiry, customer targeting (All/Selected/Individual)
- [ ] 17.6 Implement Complaint Queue screen: list with status filters, complaint detail view, In Review/Resolve actions with resolution note

## 18. Frontend — Shop Owner Portal Screens

- [ ] 18.1 Implement Shop Dashboard with open/close toggle and 4 summary cards
- [ ] 18.2 Implement Product and Category management screens: category CRUD, product CRUD with water product fields (can size picker, read-only deposit display)
- [ ] 18.3 Implement Product Rule Configuration Panel: 5 sections (quantity rules, delivery rules, floor charges, pricing with bulk discount toggle, live calculation preview that recalculates on every input change)
- [ ] 18.4 Implement Order Management screen: pending orders list, accept/reject actions, delivery person assignment/reassignment
- [ ] 18.5 Implement Delivery Person Management screen: create, deactivate, remove, reset PIN
- [ ] 18.6 Implement Customer Management screen: customer list with block/unblock actions and confirmation dialogs
- [ ] 18.7 Implement Shop Analytics screens: 4 reports (order summary, revenue, order status breakdown, top products) with time period filters

## 19. Frontend — Customer App Screens

- [ ] 19.1 Implement Customer Home screen: GPS-based shop listing (Mapbox), search bar, shop cards with Open/Closed status, Active Order Banner, Loyalty Points badge, Offers section, Pending Can Warning Banner (visible at pending_cans >= 2)
- [ ] 19.2 Implement Shop Detail screen: product categories, product listing with add-to-cart, active offers banner, minimum order notice
- [ ] 19.3 Implement one-shop cart rule: dialog on adding item from different shop, cart clear confirmation
- [ ] 19.4 Implement Checkout screen: full price breakdown (all line items including pending can deposit and deposit credit), address selector (max 5 saved), floor preferences, coupon code entry, loyalty points toggle, COD/Online selection (COD disabled if cod_blocked), pending can block enforcement (Place Order disabled if pending_cans >= 3), warning notice at pending_cans = 2
- [ ] 19.5 Implement Razorpay online payment flow: open payment sheet on Place Order, handle success/failure states, idempotency key on order placement
- [ ] 19.6 Implement Order Tracking screen: status timeline, Mapbox live map for Picked/Out for Delivery/Arriving Soon states, 5-second GPS refresh
- [ ] 19.7 Implement Reject Resolution screen: Switch Shop and Refund as distinct options; switch shop auto-suggestion display; price diff approval for higher price; reorder flow for lower-price COD
- [ ] 19.8 Implement Order History screen: order list with status filter, reorder with availability check and removed-items warning
- [ ] 19.9 Implement Post-Delivery Feedback screen: 1–5 star rating, optional text (max 500 chars), skip option
- [ ] 19.10 Implement Loyalty Points screen: balance, tier badge, progress to next tier, last 20 events, expiry notice
- [ ] 19.11 Implement Customer Profile screen: edit name, saved addresses (CRUD, max 5), delivery preferences, notification preferences, dark mode toggle, change PIN, referral code display, logout

## 20. Frontend — Delivery Person App Screens

- [ ] 20.1 Implement Delivery Dashboard: active delivery card, pending pickups list, completed today count, availability toggle
- [ ] 20.2 Implement Delivery Detail screen: customer info, floor/preferences, at-delivery can collection toggle (water orders only), mandatory live proof photo capture (camera only), Mark as Delivered button (disabled until photo uploaded and can collection confirmed)
- [ ] 20.3 Implement No-Response Protocol UI: log first call, log second call (starts auto-timer display), 10-minute countdown visible, order auto-closes with return-to-shop prompt
- [ ] 20.4 Implement Return to Shop flow: in-app prompt after auto-close or cancel-after-pickup, Return to Shop button, delivery person confirmation tap
- [ ] 20.5 Implement Extra Charge Request screen: reason selection, submit request, status tracking (pending/approved/declined/timed out), proceed at original amount on decline or timeout

## 21. Frontend — Dark Mode and Cross-Cutting

- [ ] 21.1 Verify dark mode support across all 4 role screens: system-level OS detection + manual override in app settings
- [ ] 21.2 Implement push notification handlers for all 20+ event types (foreground and background states)
- [ ] 21.3 Implement Socket.io client for real-time order status updates and GPS tracking (5-second refresh; polling fallback at 5s on WebSocket drop)
- [ ] 21.4 Implement Mapbox SDK integration: live GPS map on order tracking, delivery navigation, shop location capture in onboarding

## 22. Quality and Verification

- [ ] 22.1 Verify all 17 System Settings are readable and writable by Admin; verify correct values are used in business logic at runtime
- [ ] 22.2 Verify water can balance migration: spot-check 5 existing users have correct 20L `customer_can_balance` rows matching old `user_can_balance` values
- [ ] 22.3 Verify UPI tiered refund: test all 4 cancellation tiers (100%/60%/10%/0%) with a test account; verify deposit refunded separately in each case
- [ ] 22.4 Verify COD control: test `cod_failed_count` blocking at 3 and `cod_trust_score` blocking at 0 independently; verify both notifications fire on first block
- [ ] 22.5 Verify pending can system: test warning banner at 2, checkout block at 3, block lift after returning cans, deposit credit auto-apply from `customer_deposit_balance`
- [ ] 22.6 Verify return-to-shop flow end-to-end: cancel-after-pickup → delivery person prompt → Return to Shop → shop owner confirmation → closed; verify 60-min Admin force-close path
- [ ] 22.7 Verify all error log codes from PRD sections are emitted with correct severity levels
