## Context

ThanniGo is a React Native + Node.js/Express + MySQL platform serving four roles (Customer, Shop Owner, Delivery Person, Admin) from a single app with role-based routing. PRD v2.1 is the authoritative product spec. The codebase has partial implementations across a series of incremental changes (`can-deposit-pricing`, `user-can-balance`, `checkout-refactor`, `delivery-can-collection`, `coupon-management-system`, etc.) but no unified PRD-aligned feature set. Key gaps: the old water can model (`user_can_balance`) is incompatible with the PRD's per-can-size `pending_cans` model; COD control, tiered refund, return-to-shop flow, and most role-specific screens are unimplemented.

**Refresh audit findings (2 May 2026):**
- Tasks 1–8 have shipped: `customer_can_balances` table exists with the per-size schema; `users` carries `cancellation_count_30d`, `lifetime_cancellations`, `cod_failed_count`, `cod_trust_score`, `cod_blocked`, `successful_cod_deliveries`, `first_login`; `orders` carries `deposit_reason`, `deposit_refunded`, `return_confirmed_at`, `force_closed_by_admin`, and the `return_to_shop` enum value; the 17 PRD System Settings are seeded; `CanService` reads from `customer_can_balances`; auth, customer registration, shop onboarding (4 steps), and admin endpoints exist.
- **Drift A — API path versioning**: `routes/index.routes.js` mounts every router at `/api/...` rather than `/api/v1/...` as PRD §18.1 requires. Only `upload.routes.js` references `/api/v1/`.
- **Drift B — Customer model legacy COD fields**: `customers.cod_cancel_count`, `customers.cod_cancel_limit`, and `customers.cod_blocked` survive from the pre-PRD-v2.1 model. `OrderService.js` (lines 181, 759–763, 1456–1473) and `RefundRulesService.js` still read the legacy `Customer` columns instead of the PRD-aligned `users.cod_failed_count` / `users.cod_trust_score` / `users.cod_blocked`. Section 11 cannot land correctly until these readers/writers are migrated.
- **Drift C — Phase 2 scaffolds are present**: `payoutRouters`, `supportRouters`, `PayoutLog`, `ShopWallet`, `ShopBankChangeRequest`, `SupportTicket`, `SupportCategory`, `SupportSubcategory`, `UserOnboardingProgress`, `UserOnboardingStep` all exist. They sit outside MVP scope and stay as-is — not removed, not extended.

## Goals / Non-Goals

**Goals:**
- Full PRD v2.1 compliance across all 4 roles
- Migrate water can tracking to the per-can-size pending model
- Implement all payment, cancellation, and refund logic as specified
- Deliver all notification events across the correct channels
- Bring existing partial implementations into alignment with the PRD

**Non-Goals:**
- Phase 2 features: shop owner payout, support tickets, order splitting, QR code on can, deposit transaction history, lost can penalty, auto-apply coupons, coupon usage history, shop-wise loyalty tiers, multi-city, multi-language, COD cooldown/stricter controls
- Admin-configurable settings UI beyond what's in section 7.5 (Phase 2 item)
- Web portal (no web portal exists by design)

## Decisions

### Decision 1: Water can model — replace `user_can_balance` with per-can-size rows

**Decision**: Drop the existing `user_can_balance` table (single balance per user). Replace with a new `customer_can_balance` table: one row per `(user_id, can_size)` with columns `total_cans_given`, `total_cans_returned`, `pending_cans` (computed: given − returned), `customer_deposit_balance` (decimal, never expires). Two rows per customer: one for 20L, one for 10L.

**Rationale**: PRD explicitly tracks 20L and 10L independently. The existing single-balance model cannot express this without being rewritten. A per-size row model is clean, indexable, and directly maps to PRD fields.

**Alternative considered**: Add a `can_size` column to the existing `user_can_balance` table. Equivalent at the schema level but requires a data migration; new table name avoids confusion with old code that references the old model.

### Decision 2: Platform-wide deposit rates via `SystemSetting`

**Decision**: Store 20L and 10L deposit amounts as `SystemSetting` key/value pairs (keys: `deposit_20l`, `deposit_10l`). Admin edits via System Settings screen. Product form reads current rates and displays them as read-only. Order placement reads the current rate at time of order and stores it immutably on the order record.

**Rationale**: PRD states rates are platform-wide, set by Admin, not configurable per shop. `SystemSetting` is the existing mechanism for platform-wide config. Deposit amount on the order is immutable post-placement (PRD requirement).

**Alternative considered**: Store deposit amount directly on the product record. Rejected — PRD explicitly prohibits shop-level override and requires Admin control.

### Decision 3: COD control as two independent boolean/integer fields on `User`

**Decision**: Add `cod_failed_count` (integer, default 0), `cod_trust_score` (integer, default 5), `cod_blocked` (boolean, default false), `successful_cod_deliveries` (integer, default 0) directly to the `users` table. Either threshold independently sets `cod_blocked = true`. No separate table.

**Rationale**: These are per-user scalar values accessed on every order placement. Inline on `users` avoids a join. Two independent systems with different trigger events make a unified model awkward.

**Alternative considered**: Separate `CodControl` table. Rejected — unnecessary join overhead for every order check.

### Decision 4: UPI tiered refund via 30-day rolling counter on `users`

**Decision**: Add `cancellation_count_30d` (integer) and `lifetime_cancellations` (integer) to `users`. `cancellation_count_30d` is maintained by a nightly cron that recounts customer-initiated post-pickup cancellations in the last 30 days (not a decrement on expiry). Tier is derived at cancel time by reading `cancellation_count_30d` before incrementing.

**Rationale**: Rolling window counts are most accurately computed by counting from the `order_status_logs` table within the window rather than maintaining a decrementing counter (which can drift on cron failure). The nightly refresh ensures accuracy without real-time complexity.

**Alternative considered**: Decrement counter as old events expire. Rejected — fragile on cron failure.

### Decision 5: Return-to-shop as a formal `delivery_status` enum value

**Decision**: Add `return_to_shop` to the `delivery_status` enum in the `orders` table alongside `cancelled_after_pickup`. Add `return_confirmed_at` (timestamp) and `force_closed_by_admin` (boolean) to `orders`.

**Rationale**: PRD defines `return_to_shop` as an observable order state visible to all three parties (customer, shop, delivery person). It must be persisted, not just a transient in-app event.

### Decision 6: Notification dispatch via centralized `NotificationService`

**Decision**: All notification dispatch (push via FCM/APNs, email via Brevo, SMS via MSG91) routes through a single `NotificationService`. Domain services call `NotificationService.send(event, recipients, data)`. Actual dispatch is async via BullMQ workers.

**Rationale**: 20+ notification events across all domains. Centralizing avoids duplicate Firebase/Brevo client setup in each service. BullMQ decouples notification failures from business logic.

**Alternative considered**: Each domain service directly calls FCM/Brevo. Rejected — duplicates client config, makes channel changes invasive.

### Decision 7: Mapbox replaces Google Maps for all map views

**Decision**: Use Mapbox SDK for all map rendering (customer order tracking, delivery navigation, shop location capture). Remove any Google Maps SDK dependency.

**Rationale**: PRD v2.0 changelog explicitly replaces Google Maps with Mapbox. The backend `architecture.md` still references both — Mapbox takes precedence per PRD.

### Decision 8: Auth OTP channel priority — Brevo email first, MSG91 SMS fallback

**Decision**: OTP is sent via Brevo email. If no delivery confirmation within 30 seconds, MSG91 SMS is triggered. This applies to both Forgot PIN flow and any future OTP-gated actions.

**Rationale**: PRD specifies email as primary channel for lower cost; SMS is fallback for delivery failures. 30-second timeout is specified in PRD section 5.5.

### Decision 9: Spec files created per capability; existing conflicting specs superseded

**Decision**: The four modified capabilities (`can-deposit-pricing`, `user-can-balance`, `checkout-refactor`, `delivery-can-collection`) have delta specs in this change. Where the new spec fully replaces old behavior, the delta is written as REMOVED + ADDED rather than MODIFIED to avoid partial-content ambiguity.

### Decision 10: API path versioning — re-mount every router under `/api/v1/...`

**Decision**: PRD §18.1 specifies `/api/v1/...` for all endpoints. Update `backend/src/routes/index.routes.js` to mount every router under `/api/v1/...` (currently `/api/...`). Update the frontend API client base URL constant (and any hard-coded fetches) to match. Keep `/api/...` mounted in parallel for one release as a deprecation shim returning a `Deprecation` header, then remove.

**Rationale**: Versioning is a non-negotiable PRD contract. A short shim window prevents an in-flight mobile build from hard-failing when the backend ships first.

**Alternative considered**: Hard cut-over with a coordinated client+server release. Rejected — too risky given React Native staged rollouts.

### Decision 11: Consolidate COD control fields onto `users`; drop the legacy `customers.cod_*` columns

**Decision**: The authoritative COD control fields (`cod_failed_count`, `cod_trust_score`, `cod_blocked`, `successful_cod_deliveries`) live on `users`. Migrate every reader and writer (currently `OrderService.js` and `RefundRulesService.js`) to read/write from `User`. After all callers are migrated and CI is green, drop `customers.cod_cancel_count`, `customers.cod_cancel_limit`, and `customers.cod_blocked` in a follow-up migration.

**Rationale**: PRD §9.6 defines two independent COD systems on the customer (the human user). The `customers` table here is a profile extension, but COD control is a core auth/identity attribute used by every order placement and cancellation — keeping it on `users` matches the access path. Two parallel sources of truth invite drift bugs (the live `OrderService` already enforces a different threshold than the spec because it reads `cod_cancel_limit` instead of the System Setting).

**Migration sequence**:
1. Migrate `OrderService.handleCancellation` and `RefundRulesService` to read/write `users.cod_failed_count`, `users.cod_trust_score`, `users.successful_cod_deliveries`, and `users.cod_blocked`.
2. Backfill any non-zero `customers.cod_cancel_count` into `users.cod_failed_count` via a one-shot script.
3. Confirm no callers remain with `rg "cod_cancel_count|cod_cancel_limit"`.
4. Drop the three columns from `customers` in a follow-up migration.

**Alternative considered**: Keep both and let `Customer` mirror `User`. Rejected — PRD does not allow per-shop COD overrides; mirroring is dead weight that will drift.

### Decision 12: Phase 2 scaffolds remain present but inert

**Decision**: The model files `PayoutLog.js`, `ShopWallet.js`, `ShopBankChangeRequest.js`, `SupportTicket.js`, `SupportCategory.js`, `SupportSubcategory.js`, `UserOnboardingProgress.js`, `UserOnboardingStep.js` and the routers `payoutRouters`, `supportRouters` stay in the codebase as Phase 2 scaffolds. They are not removed, not migrated, and not extended in this change. The frontend MUST NOT import any payout or support screens.

**Rationale**: PRD §20 explicitly defers Shop Owner Payout and Support Tickets. Removing the scaffolds now creates needless churn for Phase 2 work. Treating them as dormant code keeps the cleanup mandate ("remove dead code, but never remove shared modules unless confirmed unused") aligned with future plans.

## Risks / Trade-offs

- **Water can model migration is breaking** → Mitigation: migration script to create `customer_can_balance` rows from existing `user_can_balance` data; old table retained (renamed) for rollback window.
- **`cancellation_count_30d` computed nightly may lag intraday** → Mitigation: order placement code also counts directly from `order_status_logs` for the last 30 days at cancel time (nightly cron is a cache for display, not the authoritative source).
- **Mapbox Navigation SDK adds bundle size** → Mitigation: lazy-load Mapbox screens; delivery navigation is a deep screen not in the initial load path.
- **Brevo 30-second timeout for OTP fallback adds latency** → Accepted per PRD. Log if both channels fail (AUTH0017 / NOTIF0004).
- **12 new spec files = large implementation surface** → Mitigation: tasks.md prioritizes by role-phase: Admin first (Phase 1), then Shop Owner (Phase 2), then Customer/Delivery (Phase 3) per PRD section 1.5.
- **API base path migration breaks in-flight mobile builds** → Mitigation: keep `/api/...` mounted as a deprecation shim returning a `Deprecation` header for one full release cycle; remove only after staged-rollout completion.
- **COD field migration risks double-write bugs** → Mitigation: migrate readers first (Section 11.5 task), backfill `users.cod_failed_count` from `customers.cod_cancel_count`, then drop legacy columns in a separate migration only after `rg cod_cancel_count` returns zero hits.

## Migration Plan

**Phase A — Already shipped (tasks 1–8):**

1. ✅ Run `customer_can_balance` migration (new table, per-size rows seeded from `user_can_balance`)
2. ✅ Deploy backend with new `CanService` reading from `customer_can_balance`; old `user_can_balance` reads disabled
3. ✅ Add COD control fields to `users` (default values safe for existing users)
4. ✅ Add cancellation counter fields to `users`
5. ✅ Add order table fields (`return_confirmed_at`, `force_closed_by_admin`, `deposit_reason`, `deposit_refunded`)
6. ✅ Extend `delivery_status` enum with `return_to_shop`
7. ✅ Add System Settings rows for `deposit_20l` (200), `deposit_10l` (100), and the rest of the 17 PRD-mandated keys

**Phase B — Reconciliation (this refresh):**

8. Migrate `OrderService.handleCancellation`, `OrderService.processNoResponseEvent`, and `RefundRulesService` from `customers.cod_cancel_count`/`cod_cancel_limit`/`cod_blocked` to `users.cod_failed_count`/`cod_trust_score`/`cod_blocked` (Decision 11)
9. Backfill `users.cod_failed_count` from `customers.cod_cancel_count` via a one-shot script; verify with spot-check query
10. Re-mount every router under `/api/v1/...` in `routes/index.routes.js`; keep `/api/...` as a deprecation shim returning `Deprecation: true` header (Decision 10)
11. Update frontend API client base URL from `/api/` to `/api/v1/`

**Phase C — Forward implementation (tasks 9–22):**

12. Implement Shop Owner Portal endpoints (Section 9 of tasks.md)
13. Implement Order Lifecycle (Section 10) — uses `users.*` COD fields exclusively
14. Implement Delivery Lifecycle (Section 11)
15. Implement Switch Shop, Loyalty, Referral, Notification Service (Sections 12–14)
16. Deploy frontend role screens in phased order: Admin → Shop Owner → Customer/Delivery (Sections 15–21)

**Phase D — Cleanup (after Phase B+C settle):**

17. Drop `customers.cod_cancel_count`, `customers.cod_cancel_limit`, `customers.cod_blocked` columns once `rg cod_cancel_count|cod_cancel_limit` returns zero hits (Decision 11)
18. Remove the `/api/...` deprecation shim after one full release cycle (Decision 10)
19. Rename old `user_can_balance` to `user_can_balance_archive` after 2-week soak

## Open Questions

- Should `customer_deposit_balance` be stored per-size or as a single combined balance? **Resolved**: kept per-size (one column on each `customer_can_balances` row) for traceability; `getDepositCreditBalance` already aggregates across sizes for checkout display.
- Mapbox Navigation SDK license tier — confirm with DevOps before delivery-navigation frontend work begins (Section 21.4).
