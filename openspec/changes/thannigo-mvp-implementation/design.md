## Context

ThanniGo is a React Native + Node.js/Express + MySQL platform serving four roles (Customer, Shop Owner, Delivery Person, Admin) from a single app with role-based routing. PRD v2.1 is the authoritative product spec. The codebase has partial implementations across a series of incremental changes (`can-deposit-pricing`, `user-can-balance`, `checkout-refactor`, `delivery-can-collection`, `coupon-management-system`, etc.) but no unified PRD-aligned feature set. Key gaps: the old water can model (`user_can_balance`) is incompatible with the PRD's per-can-size `pending_cans` model; COD control, tiered refund, return-to-shop flow, and most role-specific screens are unimplemented.

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

## Risks / Trade-offs

- **Water can model migration is breaking** → Mitigation: migration script to create `customer_can_balance` rows from existing `user_can_balance` data; old table retained (renamed) for rollback window.
- **`cancellation_count_30d` computed nightly may lag intraday** → Mitigation: order placement code also counts directly from `order_status_logs` for the last 30 days at cancel time (nightly cron is a cache for display, not the authoritative source).
- **Mapbox Navigation SDK adds bundle size** → Mitigation: lazy-load Mapbox screens; delivery navigation is a deep screen not in the initial load path.
- **Brevo 30-second timeout for OTP fallback adds latency** → Accepted per PRD. Log if both channels fail (AUTH0017 / NOTIF0004).
- **12 new spec files = large implementation surface** → Mitigation: tasks.md prioritizes by role-phase: Admin first (Phase 1), then Shop Owner (Phase 2), then Customer/Delivery (Phase 3) per PRD section 1.5.

## Migration Plan

1. Run `customer_can_balance` migration (new table, per-size rows seeded from `user_can_balance`)
2. Deploy backend with new `CanService` reading from `customer_can_balance`; old `user_can_balance` reads disabled
3. Add COD control fields to `users` (default values safe for existing users)
4. Add cancellation counter fields to `users`
5. Add order table fields (`return_confirmed_at`, `force_closed_by_admin`, `deposit_reason`, `deposit_refunded`)
6. Extend `delivery_status` enum with `return_to_shop`
7. Add System Settings rows for `deposit_20l` (200) and `deposit_10l` (100)
8. Deploy frontend role screens in phased order: Admin → Shop Owner → Customer/Delivery
9. Rename old `user_can_balance` to `user_can_balance_archive` after 2-week soak

## Open Questions

- Should `customer_deposit_balance` be stored per-size or as a single combined balance? PRD does not specify explicitly. Recommendation: per-size (same row as pending_cans) for traceability.
- Mapbox Navigation SDK license tier — confirm with DevOps before frontend implementation begins.
