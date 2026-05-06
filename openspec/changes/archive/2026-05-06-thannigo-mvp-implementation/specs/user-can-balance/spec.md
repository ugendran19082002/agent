## REMOVED Requirements

### Requirement: Per-user can balance ledger
**Reason**: The single `user_can_balance` model (one row per user with `cans_given` and `cans_returned`) is incompatible with PRD v2.1, which requires independent tracking per can size (20L and 10L). The new model is defined in `water-can-pending-system`.
**Migration**: 
1. Create the new `customer_can_balance` table with `(user_id, can_size)` as composite key and fields `total_cans_given`, `total_cans_returned`, `pending_cans`, `customer_deposit_balance`.
2. Migrate existing `user_can_balance` rows: create two rows per user (one for 20L, one for 10L) where the 20L row gets the existing `cans_given`/`cans_returned` values and the 10L row starts at zero (since the old model was not size-aware).
3. Rename old `user_can_balance` table to `user_can_balance_archive` after a 2-week soak period.
4. Update all backend code that references `user_can_balance` to use `customer_can_balance`.

### Requirement: Cans given increments on delivery confirmation
**Reason**: Superseded by the `water-can-pending-system` requirement "total_cans_given increments on delivery confirmation", which adds per-can-size granularity.
**Migration**: Update delivery confirmation logic to increment `total_cans_given` on the `customer_can_balance` row matching the order's can size, not the old `user_can_balance` row.

### Requirement: Cans returned increments on collection confirmation
**Reason**: Superseded by the `water-can-pending-system` requirement for `total_cans_returned` with per-size tracking.
**Migration**: Update delivery can collection confirmation to increment `total_cans_returned` on the `customer_can_balance` row matching the order's can size.

### Requirement: Can balance exposed via API
**Reason**: The old endpoint `GET /api/user/can-balance` returned a single balance. The new API must return per-size balances.
**Migration**: Replace `GET /api/user/can-balance` with `GET /api/v1/cans/balance` (per PRD route map) which returns an array of `{can_size, total_cans_given, total_cans_returned, pending_cans, customer_deposit_balance}` — one entry per can size.
