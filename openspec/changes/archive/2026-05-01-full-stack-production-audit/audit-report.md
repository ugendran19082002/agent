# ThanniGo Full-Stack Production Audit

Date: 2026-05-01
Scope: Expo React Native frontend, Node/Express backend, MySQL/Sequelize database, Razorpay payments, Firebase, Ubuntu/Nginx deployment assumptions, and major config files.

## Executive Summary

ThanniGo has a strong production foundation: Express route/controller/service layering, Sequelize models, global middleware, response helpers, frontend API modules, Zustand stores, Zod schemas, reusable UI primitives, ErrorBoundary, offline and maintenance screens, Razorpay models, webhook storage, and duplicate-index cleanup scripts.

The main production risks are not missing features; they are hardening gaps:

- P0: Tracked secrets and environment files must be removed from git history and rotated.
- P0: Razorpay `payment.failed` webhook references an undefined variable and can fail while processing a failure event.
- P0: Production app code still defaults to `localhost` for API, socket, and remote error logging when `EXPO_PUBLIC_API_URL` is missing.
- P1: Several backend routes lack validation on mutating actions, especially order/shop/admin/payment/refund paths.
- P1: Payment reconciliation route expects `result.success`, but the service returns no `success` field, causing successful reconciliation results to be returned as errors.
- P1: `checkout.tsx` and several shop/admin screens are too large and mix UI, business logic, API orchestration, retry state, and payment provider logic.
- P1: MySQL integrity is partially handled, but high-value flows need stricter transaction and constraint review before production.
- P2: UI state coverage exists but is inconsistent; many screens use local spinners/toasts instead of shared skeleton, empty, error, and retry patterns.

## Follow-Up Fixes Applied

- Fixed `TG-P0-002`: `backend/src/services/payment/PaymentService.js` now handles Razorpay `payment.failed` webhooks without referencing the `payment.captured`-scoped `pt` variable. It fetches the matching payment row, updates payment and attempt failure state, and marks the related order failed by `payment.order_id`.
- Fixed `TG-P1-004`: `PaymentService.reconcilePayment()` now returns a `success` boolean for already-paid, reconciled, and still-pending outcomes, matching `payment.routes.js`.
- Fixed part of `TG-P0-003`: frontend API configuration now lives in `frontend/config/api.ts`; `api/client.ts`, `utils/socket.ts`, and `utils/logger.ts` use the shared normalized API URL. Production builds now throw if `EXPO_PUBLIC_API_URL` is missing or points to a local address.
- Fixed `TG-P2-015`: `utils/socket.ts` now reads the in-memory API token first and falls back to the same versioned persisted session key used by the API client instead of reading `access_token` directly.

## Audit Register

| ID | Severity | Area | Files | Issue | Exact Fix | Verification |
|---|---|---|---|---|---|---|
| TG-P0-001 | P0 | Secrets/config | `backend/thanigo-7c13b-firebase-adminsdk-fbsvc-ab26c95240.json`, `frontend/.env`, `frontend/google-services.json`, `frontend/GoogleService-Info.plist` | Secret/config files are tracked. Backend service account contains a private key; frontend env can expose deploy-specific API keys/URLs. | Rotate Firebase service account key, remove backend service account JSON from repo, load Firebase Admin credentials from env or server secret file outside repo. Remove tracked frontend `.env`; keep `.env.example` only. Keep mobile Google service files only if they contain non-secret app identifiers and are intentionally public; otherwise regenerate via EAS secrets. | `git -C backend ls-files '*firebase*json'`; `git -C frontend ls-files .env '*.plist' '*google-services.json'`; verify keys rotated in Firebase console. |
| TG-P0-002 | P0 | Payments | `backend/src/services/payment/PaymentService.js:175-186` | `payment.failed` webhook branch calls `pt.order_id`, but `pt` is scoped only inside the `payment.captured` branch. A failed payment webhook can throw and be returned as `error_logged`. | In failed branch fetch the payment row before update, validate amount/order if available, then update `Order` by `payment.order_id`. Persist webhook `error_message` when processing fails. | Send Razorpay `payment.failed` webhook fixture; expect `webhook_events.is_processed=1`, payment attempt `failed`, order `failed`, no ReferenceError. |
| TG-P0-003 | P0 | Production config | `frontend/api/client.ts:10`, `frontend/utils/socket.ts:4`, `frontend/utils/logger.ts:26` | Missing `EXPO_PUBLIC_API_URL` silently defaults to localhost. A production build can ship with unreachable API/socket/error reporting. | Add a config module that throws in production if `EXPO_PUBLIC_API_URL` is missing or localhost. Use the same normalized base for axios, socket, uploads, and logger. | Build release with env missing; app must fail fast during startup/build. Build release with production URL; login/API/socket smoke test succeeds. |
| TG-P1-004 | P1 | Payments | `backend/src/routes/v1/payment/payment.routes.js:403-407`, `backend/src/services/payment/PaymentService.js:206-245` | Reconcile route checks `result.success`, but service returns `{ message, payment_id }` or `{ message, status }`. Successful reconcile is treated as 400. | Return `{ success: true, ... }` when paid and `{ success: false, ... }` when pending/failed, or route on payment status instead of `success`. | Mock Razorpay paid order; POST `/payments/:id/reconcile` as admin returns 200. Mock pending order returns 400 or 202 with clear status. |
| TG-P1-005 | P1 | API validation | `backend/src/routes/v1/order/order.routes.js:416-466`, `backend/src/routes/v1/shop/shop.routes.js:346-444`, `backend/src/routes/v1/payment/payment.routes.js:389-439`, `backend/src/routes/v1/admin/admin.routes.js:97-223` | Many mutating endpoints have no `express-validator` schemas for params/body/query. Some rely only on service errors or manual inline checks. | Add route-boundary validators for calculate/reorder/status/reschedule/floor-change/shop settings/products/bank/promotions/refunds/admin actions. Reuse `validate()` middleware and return `VALIDATION_ERROR`. | Send invalid param/body to each mutating route; controller/service should not execute and response must be 422 with field-level details. |
| TG-P1-006 | P1 | Route docs/behavior | `backend/src/routes/v1/shop/shop.routes.js:335-343` | Comments label public shop routes, but `router.use(authenticateToken)` runs before them, so they are protected. This may be intended for customer app, but the naming is misleading and can break unauthenticated browsing. | Decide contract: public browse routes go before `authenticateToken`; protected personalized routes stay behind auth. If auth is required, rename comments/API docs. | Unauthenticated GET `/api/shops` returns expected public list or 401 by explicit documented requirement. |
| TG-P1-007 | P1 | Frontend payment | `frontend/app/order/checkout.tsx:907-990`, `frontend/app/order/checkout.tsx:1880-1930` | Native SDK is used in production and WebView is gated by `__DEV__`, which is good. But provider logic, retry, verification, WebView HTML, and UI state live inside a 2,476-line screen. | Extract `services/payment/razorpayAdapter.ts` with `startPayment`, `verifyPayment`, `handleCancel`, `handleFailure`, `canUseWebViewFallback`. Screen only calls adapter and renders state. | Unit or smoke test adapter decisions: production => native only; Expo Go/dev => WebView allowed; cancel/fail/success all produce typed outcomes. |
| TG-P1-008 | P1 | Frontend duplicate action | `frontend/app/order/checkout.tsx:1663-1725` | Checkout button is disabled by `isSubmitting`, but payment retry path runs before the main place-order try block and does not visibly set a pending state around the retry create-order call. | Wrap all checkout submit paths in one `submitCheckout()` guarded by a ref/state lock, including retry. Always set pending label: placing order, opening payment, verifying payment. | Rapid tap payment button 5 times; only one order/payment attempt is created and one SDK session opens. |
| TG-P1-009 | P1 | DB/payment consistency | `backend/src/model/Payment.js`, `backend/src/services/payment/PaymentService.js:35-60` | `Payment.upsert()` is used without an obvious unique key for order-level upsert. `razorpay_payment_id` is unique but null during create-order; `razorpay_order_id` is indexed but not unique in `Payment`. | Add explicit unique key on `payments.order_id` if only one master payment per order, or replace upsert with find/update/create in transaction keyed by `order_id`. Keep attempts in `payment_attempts`. | Create multiple retries for one order; verify one master payment row and N payment_attempt rows. |
| TG-P1-010 | P1 | CORS/security | `backend/src/config/middleware.js:43-59` | Production CORS still allows origins containing localhost/127.0.0.1/192.168 and Expo scheme in addition to `FRONTEND_URL`. This is convenient but too broad for production web/admin surfaces. | In production, allow only configured `FRONTEND_URL` and mobile no-origin requests. Move dev origins behind non-production check. | With `NODE_ENV=production`, request from `http://localhost` with Origin header is rejected; configured domain succeeds. |
| TG-P1-011 | P1 | Error handling | `backend/src/routes/v1/*`, `backend/src/controllers/*` | Mixed patterns: `asyncHandler`, inline `try/catch`, direct `res.json`, and manual status responses. This fragments error codes and response details. | Adopt `asyncHandler` + `sendSuccess/sendError` everywhere. Throw typed errors from services with `statusCode` and `code`; avoid direct `res.status().json()` except webhooks/health. | `rg "res\\.status|res\\.json" backend/src/routes backend/src/controllers` trends down to intentional exceptions only. |
| TG-P1-012 | P1 | Upload/security | `backend/src/routes/v1/upload/upload.routes.js`, `backend/src/controllers/upload/upload.controller.js`, `backend/src/services/upload/UploadService.js` | Upload stack exists, but production audit must confirm size limits, MIME sniffing, extension allowlist, image processing, path traversal prevention, and private/public file segregation. | Document upload contracts per document type and enforce size/MIME/extension in one middleware. Store paths from sanitized generated names only. | Invalid MIME renamed as `.jpg` is rejected; oversized upload returns 413/400; accepted image is resized and path is safe. |
| TG-P2-013 | P2 | Frontend structure | `frontend/app/order/checkout.tsx`, `frontend/app/shop/(tabs)/inventory.tsx`, `frontend/app/(tabs)/index.tsx`, `frontend/app/shop/profile.tsx`, `frontend/app/admin/vendors/[id].tsx` | Many screens exceed 1,000 lines and combine data fetching, presentation, validation, mutations, styles, and navigation. | Split into feature folders: `screens/<feature>/components`, `hooks`, `types`, and `styles`. Keep route files as composition shells. | Largest screen under ~500 lines; extracted hooks have focused tests or smoke checks. |
| TG-P2-014 | P2 | UI state consistency | `frontend/app/**`, `frontend/components/ui/*` | Reusable `Skeleton`, `EmptyState`, `OfflineScreen`, `ErrorBoundary`, and `AppToast` exist, but screens frequently use ad-hoc `ActivityIndicator`, local empty text, and inconsistent retry actions. | Add `ScreenState`/`AsyncStateView` helper using existing UI primitives. Migrate data screens incrementally by role. | Spot check customer orders, shop inventory, admin vendors, delivery history: all show loading, empty, error, retry. |
| TG-P2-015 | P2 | Socket auth | `frontend/utils/socket.ts:11`, `frontend/api/client.ts:7-33` | Axios session uses versioned session storage, but socket reads `SecureStore.getItemAsync('access_token')`, which may not match the persisted session key. | Read token from the same session storage helper used by API client or expose a shared session token accessor. | Fresh login then tracking screen connects socket with valid token without app restart. |
| TG-P2-016 | P2 | Deployment | No Nginx/PM2/systemd files found | Repo has no checked deployment template for Nginx reverse proxy, TLS, upload body size, health check, process manager, or log rotation. | Add `deploy/nginx/thannigo-api.conf.example`, `deploy/systemd/thannigo-api.service.example` or PM2 ecosystem, and deployment checklist. | New Ubuntu server can be configured from repo docs without tribal knowledge. |
| TG-P1-017 | P1 | Frontend build health | `frontend/app/(tabs)/profile.tsx:266`, `frontend/app/admin/(tabs)/vendors.tsx:91`, lint output | `npx tsc --noEmit` fails on JSX syntax in profile screen. `expo lint` fails with 50 errors and 405 warnings, including conditional hooks in admin vendors and many JSX escaping/display-name issues. | Fix syntax errors first, then hooks rule violations, then lint errors that affect runtime correctness. Treat warnings as cleanup after build-blocking errors. | `cd frontend && npx tsc --noEmit`; `cd frontend && npm run lint` both pass. |

## Backend API Audit

### Route Map

| Route group | Mount | Auth/role pattern | Validation status | Notes |
|---|---|---|---|---|
| Auth | `/api/auth` | Public for OTP/PIN login; token for me/logout/PIN enable/email OTP | Good for core login/PIN via validators | Add rate limit confirmation for PIN login and biometric login, not only OTP. |
| User/profile/address | `/api/users` | `router.use(authenticateToken)` plus admin role for list/status | Mixed: profile/address creation has rules, update/delete/default/security need stronger validators | Payment methods endpoint returns placeholder data. |
| Shop/product | `/api` | `router.use(authenticateToken)` then customer/shop/admin role checks | Many mutating shop/product/promotion/schedule routes lack schemas | "Public Shop Routes" are currently auth-protected. |
| Order | `/api` | `router.use(authenticateToken)` plus shop/delivery role checks | Place/cancel/status have validators; calculate/reorder/reschedule/assign/floor-change do not | Critical because it touches cart totals, delivery, refunds, and customer confirmation. |
| Payment/refund | `/api` | Webhook public; rest token; selected admin/shop role checks | Create/verify validated; record/refund/reconcile/history query lacks schemas | Reconcile route/service shape mismatch. |
| Delivery/inventory | `/api` | Token plus delivery/shop/admin/customer role checks | Location and charge request validate; proof/complete/inventory need more schemas | Tracking endpoint should explicitly validate order id and ownership. |
| Engagement/promotion | `/api`, `/api/promotion` | Token plus selected shop/admin checks | Mostly manual inline validation | Use schemas for push tokens, ratings, complaints, SOS, coupon/referral actions. |
| Support | `/api` | Per-route token and admin role checks | Manual inline validation | Add validators for flow/category/subcategory/status/assignment. |
| Admin | `/api/admin` | `router.use(authenticateToken, authorize("admin"))` | Mostly no route-bound validators | High privilege; every mutating action needs body/param schemas. |
| System | `/api/system` | Public read endpoints; admin for bank mutations; report-error public | Some manual checks | Add body size/shape limit for frontend error report. |
| Upload | `/api/upload` | Token and app auth | Upload validators exist | Confirm MIME/size/path handling before prod. |
| Payout | `/api/shop-owner/payouts` | Token + shop_owner | No validators visible in routes | Add schemas for instant payout, verify bank/UPI, settings. |

### Backend Success Scenarios

- Valid auth OTP/PIN login returns access token, refresh token, user role, and session state.
- Valid customer order with COD creates order, order items, status log, inventory decrement, notification job, and socket event.
- Valid online order creates pending order, Razorpay order, `Payment`, and `PaymentAttempt`.
- Valid Razorpay success verifies HMAC, marks attempt paid, finalizes order, deducts inventory, logs status, and notifies.
- Valid shop/admin status update returns updated order with auditable status log.
- Valid delivery location update stores coordinates and returns a consistent success envelope.
- Valid support ticket creation returns ticket id and appears in customer/shop/admin support lists.

### Backend Failure Scenarios

- Invalid input: return 422 `VALIDATION_ERROR` before service logic.
- Unauthorized: return 401 when token is missing/expired; 403 when role is wrong.
- Duplicate idempotency key: return existing matching order intent or a clear conflict when payload differs.
- Service/business failure: return stable error code for unavailable slot, amount mismatch, invalid payment signature, order not found, shop not found, inventory unavailable.
- Unexpected error: log with request context and return sanitized 500 with correlation id.
- Webhook replay: return idempotent already-processed result and avoid duplicate finalization.

### Backend Code Examples

Validator pattern:

```js
export const validateRefundRequest = [
  body("order_id").isInt({ min: 1 }).withMessage("Valid order_id is required"),
  body("reason").isLength({ min: 5, max: 255 }).withMessage("Reason must be 5-255 chars"),
];

router.post(
  "/refunds",
  authorize("shop_owner", "admin"),
  validate(validateRefundRequest),
  asyncHandler(async (req, res) => {
    const refund = await RefundService.initiateRefund(req.user.user_id, req.body);
    return sendSuccess(res, refund, "Refund initiated", STATUS_CODES.CREATED);
  }),
);
```

Typed service error:

```js
export class ApiError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR", details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

throw new ApiError("Order amount mismatch", 400, "PAYMENT_AMOUNT_MISMATCH");
```

## Frontend Audit

### Screen Flow Map

- Auth: `auth/login`, `auth/otp`, `auth/quick-login`, `auth/forgot-pin`, `auth/role`.
- Customer: tabs home/search/orders/profile plus addresses, shop detail, checkout, schedule, tracking, cancel, rating, rewards, support, payment history/methods.
- Shop owner: shop tabs home/inventory/earnings/settings plus profile, schedule, slots, products, can management, staff, fleet, delivery, promotions, complaints, reviews, payout settings, manual order.
- Delivery: active jobs, navigation, charge requests, complete delivery, earnings, history.
- Admin: dashboard, vendors, users, orders, refunds, payouts, bank requests, complaints, coupons, features, master data, support.
- Global: `RouteGuard`, `AppSessionProvider`, root `ErrorBoundary`, `OfflineScreen`, `MaintenanceScreen`, `GlobalToast`.

### UI State Findings

- Good: Root-level `ErrorBoundary`, offline screen, maintenance screen, global toast, reusable button, skeleton, empty state, and theme tokens exist.
- Gap: Many data screens use local `ActivityIndicator` and local empty text instead of `Skeleton`/`EmptyState`.
- Gap: Some large screens manually coordinate multiple async actions with separate booleans, which increases the chance of button-not-responding bugs.
- Gap: Payment verification failure leaves user in a support-needed state but does not route to a payment pending/retry/support screen.
- Gap: Retry behavior is inconsistent; some screens show toast only, others show a visible retry button.

### Frontend Success Scenarios

- Login: valid phone/PIN/OTP disables button during submit, refreshes session, stores token, and navigates by role.
- API success: data screen shows skeleton while fetching, renders data, supports pull-to-refresh where useful.
- Empty success: zero orders/payments/shops/reviews/support tickets show a useful empty state and next action.
- Payment success: SDK success triggers backend verify before navigation to confirmed order.
- Navigation success: role guard sends customer/shop/delivery/admin users to correct route group.

### Frontend Failure Scenarios

- Network failure: app shows offline screen or local retry state; no silent blank screen.
- API failure: screen shows error state with retry and toast only for action feedback.
- Invalid input: form blocks submit and shows field-level message.
- Duplicate action: buttons disable or lock by action key until request completes.
- Crash: route remains inside `ErrorBoundary`, error is reported without exposing sensitive data.

### Reusable Frontend Patterns To Add

```ts
type AsyncStatus = "idle" | "loading" | "success" | "empty" | "error";

export function getListStatus<T>(loading: boolean, error: unknown, data: T[]): AsyncStatus {
  if (loading) return "loading";
  if (error) return "error";
  if (!data.length) return "empty";
  return "success";
}
```

Payment adapter shape:

```ts
export type PaymentOutcome =
  | { type: "success"; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
  | { type: "cancelled"; reason?: string }
  | { type: "failed"; code?: string; message: string };

export async function startRazorpayPayment(options: RazorpayOptions): Promise<PaymentOutcome> {
  if (!__DEV__) {
    const native = await RazorpayCheckout.open(options);
    return { type: "success", ...native };
  }
  return startDevWebViewPayment(options);
}
```

## Payment Audit

### Production Vs Development

- Production path: `frontend/app/order/checkout.tsx:982` calls `RazorpayCheckout.open(options)`.
- Dev path: `frontend/app/order/checkout.tsx:973-980` uses WebView only under `__DEV__`.
- Dev WebView modal and preloader are gated by `__DEV__`, which matches the desired architecture.
- Risk remains because payment logic is inline and not protected by a build-time assertion. Add a production guard that fails if the native module is unavailable instead of falling back to WebView.

### Payment Success Flow

1. Customer places online/UPI order.
2. Backend creates pending order and Razorpay order.
3. App opens native Razorpay in production.
4. App receives success payload.
5. App calls `/payments/razorpay/verify`.
6. Backend verifies HMAC, updates payment and attempt, finalizes order, sends notification, and returns paid status.
7. App clears cart and navigates to confirmed order.

### Payment Failure Flow

- User cancel: app stores pending order data and shows cancellation toast.
- SDK failure: app shows failure toast and allows safe retry.
- Network timeout before verify: app should keep pending order and offer retry verification/reconcile.
- Backend verify failure: app must not mark paid; show supportable state with order/payment ids.
- Webhook failure: backend should persist event error and keep retryable state.

### Exact Payment Fixes

1. Fix `PaymentService.processWebhook` failed branch:

```js
} else if (event.event === "payment.failed") {
  const p = event.payload.payment.entity;
  const payment = await Payment.findOne({ where: { razorpay_order_id: p.order_id }, transaction: t });
  if (!payment) return;

  const failureDetails = {
    failure_code: p.error_code || null,
    failure_reason: p.error_description || p.error_reason || null,
  };

  await payment.update(
    { status: "failed", razorpay_payment_id: p.id, gateway_response: failureDetails },
    { transaction: t },
  );
  await PaymentAttempt.update(
    { status: "failed", razorpay_payment_id: p.id, gateway_response: failureDetails },
    { where: { razorpay_order_id: p.order_id }, transaction: t },
  );
  await Order.update(
    { status: "failed", payment_status: "failed" },
    { where: { id: payment.order_id }, transaction: t },
  );
}
```

2. Fix reconcile service/route shape:

```js
return { success: true, message: "Payment successfully reconciled and marked as paid.", payment_id: payment.id };
// and
return { success: false, message: "Payment is still pending or failed on Razorpay.", status: rzpOrder.status };
```

3. Extract frontend adapter and make checkout screen consume typed outcomes.

## MySQL And Sequelize Audit

### Model And Consistency Notes

- `Order` has unique `order_number`, unique `razorpay_order_id`, and unique `idempotency_key`, which is good for critical duplicate prevention.
- `PaymentAttempt` has unique `razorpay_order_id + attempt_number` and unique `razorpay_payment_id`, which supports retries.
- `WebhookEvent` has unique `event_id`, good for webhook replay idempotency.
- `Payment` has unique `razorpay_payment_id`, but should explicitly model whether it is one row per order. Current `Payment.upsert()` implies one master payment per order.
- Order/payment finalization uses transactions, but webhook failed branch has a bug and finalization reads order outside the passed transaction in `finalizeOrderAfterPayment`, so audit transaction isolation further before production.

### Index Review

- Duplicate index cleanup script exists at `backend/src/scripts/cleanup-duplicate-indexes.js`.
- The script is powerful and destructive; run only after backup and staging dry-run output.
- Add a dry-run mode before production use:

```js
const DRY_RUN = process.env.DRY_RUN !== "false";
if (DRY_RUN) {
  logger.warn(`[DRY_RUN] Would drop ${indexName} on ${table}`);
} else {
  await sequelizeDb.query(`ALTER TABLE \`${table}\` DROP INDEX \`${indexName}\``);
}
```

### Query/Index Priorities

- Auth: `users.phone`, `refresh_tokens.token`, `user_devices.user_id`.
- Shops: geolocation/radius search fields, `owner_user_id`, `status`, `onboarding_status`.
- Orders: `user_id + created_at`, `shop_id + status`, `delivery_person_id + status`, `status + created_at`, `idempotency_key`, `order_number`.
- Payments: `order_id`, `user_id + created_at`, `shop_id + created_at`, `razorpay_order_id`, `razorpay_payment_id`.
- Delivery: assignment order/person/status, location logs by delivery person and time.
- Webhooks: `event_id`, `is_processed + created_at`, provider payment/order ids.

## Production Readiness Audit

### Environment Variables

Required backend env:

- `NODE_ENV`, `ENVIRONMENT`, `PORT`, `APPLICATION_KEY`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`, `JWT_EXPIRY`, refresh token settings if applicable
- `CSRF_SECRET`
- `FRONTEND_URL`
- `REDIS_HOST`, `REDIS_PORT`, Redis password/TLS if production
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RAZORPAY_ACCOUNT_NUMBER`
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- SMTP/SMS provider credentials

Required frontend env:

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_MAPBOX_TOKEN`, `EXPO_PUBLIC_MAPBOX_STYLE`
- public Razorpay key only if used client-side; secret must never be in frontend

### Ubuntu/Nginx Checklist

No Nginx/systemd/PM2 config was found in the repo. Add examples with:

- TLS termination and HTTP to HTTPS redirect.
- `proxy_set_header Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`.
- `client_max_body_size` aligned with upload limits.
- `/api/health` upstream health smoke.
- `/uploads` handling, either served by Nginx from a controlled directory or proxied intentionally.
- WebSocket proxy headers for Socket.io.
- Node process manager restart policy and log rotation.

Example Nginx proxy core:

```nginx
location /api/ {
  proxy_pass http://127.0.0.1:3000/api/;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}

location /socket.io/ {
  proxy_pass http://127.0.0.1:3000/socket.io/;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
}
```

## File-By-File Notes

### Frontend

- `frontend/app/_layout.tsx`: Good global ErrorBoundary/offline/maintenance/toast setup.
- `frontend/providers/AppSessionProvider.tsx`, `RouteGuard.tsx`, `SessionContext.ts`: Critical auth state; verify role routing and unauthorized purge scenarios.
- `frontend/api/client.ts`: Good refresh queue, but localhost fallback is production risk.
- `frontend/api/*Api.ts`: Good separation by domain; normalize error handling through `ApiError.from`.
- `frontend/app/order/checkout.tsx`: Highest frontend refactor priority. Extract payment adapter, order summary, address selector, coupon/loyalty, bill breakdown, delivery slot, and submit orchestration.
- `frontend/app/(tabs)/index.tsx`, `orders.tsx`, `search.tsx`, `profile.tsx`: Customer critical screens; standardize loading/empty/error states.
- `frontend/app/shop/**`: Many large operational screens. Split inventory/profile/promotions/staff/slots/payout settings into hooks and components.
- `frontend/app/delivery/**`: Critical for live delivery; verify offline/location permission/retry states.
- `frontend/app/admin/**`: High privilege; add confirmation, disabled state, and validation for destructive actions.
- `frontend/components/ui/*`: Good primitives. Use them consistently instead of screen-local ad-hoc states.
- `frontend/utils/socket.ts`: Align token source and API base config with `api/client.ts`.
- `frontend/utils/logger.ts`: Avoid localhost fallback in production and rate-limit frontend error reporting.
- `frontend/app.json`, `frontend/eas.json`, `frontend/package.json`: Confirm native Razorpay, Firebase, permissions, and release env profiles.

### Backend

- `backend/src/app.js`: Good health and centralized final error handler; CSRF bypass for `/api` is acceptable for JWT/app-key mobile API but document it.
- `backend/src/config/middleware.js`: Good helmet/compression/rate limit/XSS setup; tighten production CORS.
- `backend/src/routes/index.routes.js`: Route mounting is clear; Swagger custom JS is dev/admin convenience and should not expose tokens in public docs.
- `backend/src/routes/v1/auth/auth.routes.js`: Good validation on main auth actions; add PIN/biometric abuse rate limits if not covered globally.
- `backend/src/routes/v1/order/order.routes.js`: Critical mutating route validators incomplete.
- `backend/src/routes/v1/payment/payment.routes.js`: Create/verify good; reconcile and refund need validator/response fixes.
- `backend/src/routes/v1/shop/shop.routes.js`: Many inline handlers and missing validators; public/protected comment mismatch.
- `backend/src/routes/v1/admin/admin.routes.js`: High-privilege route group needs validators and audit logging per mutation.
- `backend/src/routes/v1/delivery/delivery.routes.js`: Add validators to proof, complete, inventory, tracking paths.
- `backend/src/controllers/**`: Mixed direct JSON and response helpers. Standardize.
- `backend/src/services/order/OrderService.js`: Business-critical and large; split order calculation, placement, payment finalization, assignment, cancellation/refund, fallback search.
- `backend/src/services/payment/PaymentService.js`: Fix webhook failed branch, reconcile shape, and master payment uniqueness.
- `backend/src/services/payout/*`, `ShopBankService`, `Refund*`: Remove dummy Razorpay fallback in production; fail fast if keys are missing.
- `backend/src/model/**`: Good broad model coverage; add explicit constraints around master payment/order and review nullable fields.
- `backend/src/scripts/*`: Separate safe idempotent migrations from scratch/destructive repair scripts. Add dry-run for destructive DB cleanup.

## Recommended Implementation Order

1. Rotate/remove tracked secrets and add `.env.example` files.
2. Add production config guard for `EXPO_PUBLIC_API_URL` and backend Razorpay/Firebase secrets.
3. Fix payment webhook failed branch and reconcile response shape.
4. Add validators to payment/refund/order/shop/admin mutating routes.
5. Extract frontend payment adapter and checkout submit lock.
6. Add MySQL migration/dry-run plan for duplicate indexes and payment uniqueness.
7. Migrate high-traffic screens to shared loading/empty/error/retry state.
8. Split large route screens/services into focused modules.
9. Add deployment templates for Nginx and process manager.
10. Run full release checklist.

## Release Verification Checklist

- Backend starts with production env and no dummy Razorpay/Firebase values.
- `GET /api/health` returns database-connected response.
- CORS rejects unconfigured browser origins in production.
- Login OTP/PIN success and invalid input failure work.
- Customer can load shops, place COD order, and view order status.
- Customer can place UPI/native Razorpay order in production-like build.
- Razorpay success verifies server-side before confirmed screen.
- Razorpay failed/cancelled/network timeout leaves retryable pending state.
- Webhook replay does not duplicate payment/order finalization.
- Shop owner can view/update orders and inventory.
- Delivery user can update location and complete delivery.
- Admin can perform high-privilege actions with validation and audit logging.
- Frontend offline mode and API 500 toast/error states work.
- MySQL backup exists before index/constraint migrations.
- Nginx proxies API and Socket.io with correct headers.

## Verification Performed In This Audit

- Read OpenSpec proposal, design, specs, and tasks.
- Inventoried major frontend and backend files with `find` and `rg`.
- Counted largest files with `wc -l`.
- Reviewed route mounting, middleware, API client, socket config, logger config, payment routes/service/models, order model/service, checkout payment logic, and deployment/config surfaces.
- Checked tracked secret/config files with `git -C backend ls-files` and `git -C frontend ls-files`.
- Confirmed OpenSpec apply progress is `34/34` tasks complete.
- Ran backend syntax check: `find backend/src -type f -name '*.js' -print0 | xargs -0 -n 1 node --check` passed.
- Ran frontend typecheck: `cd frontend && npx tsc --noEmit` failed on `app/(tabs)/profile.tsx` JSX syntax errors at lines 266, 270, 310, 581-585.
- Ran frontend lint: `cd frontend && npm run lint` failed with 50 errors and 405 warnings. High-priority examples include `app/(tabs)/profile.tsx` parse error and `app/admin/(tabs)/vendors.tsx` conditional React hook calls.

## Verification Still Needed

- Run backend startup smoke with valid env.
- Fix frontend lint/typecheck failures and rerun.
- Run Razorpay native flow on physical Android/iOS dev-client or production-like build.
- Run MySQL duplicate index audit against staging DB.
- Confirm production domains and Nginx server block details.
