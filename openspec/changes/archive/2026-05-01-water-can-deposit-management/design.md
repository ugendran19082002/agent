## Context

The water delivery business uses reusable 20L and 10L cans. Customers pay a refundable deposit when they first receive a can. On refill orders, if the customer returns the empty can at delivery time, no deposit is charged — only the water price. Currently the system has no deposit logic, no can tracking, and no way for delivery personnel to confirm can collection. All water products are identified by an `is_water` flag on the product model.

## Goals / Non-Goals

**Goals:**
- Track per-user can balance (given minus returned) in the database
- Auto-calculate deposit charge at order creation based on current balance
- Allow delivery personnel to confirm or override empty can collection, triggering a retrospective deposit if not collected
- Show deposit as a conditional line item in the customer order UI

**Non-Goals:**
- QR code per-can tracking (Phase 2)
- Deposit wallet system (Phase 2)
- Lost-can penalty system (Phase 2)
- Multi-product-type deposit tiers beyond 20L/10L (not needed now)

## Decisions

### Decision 1: Simple count-based can balance (not per-can tracking)

Store `cans_given` and `cans_returned` per user (aggregate counts), not individual can serial numbers.

**Why**: Per-can tracking requires physical labeling infrastructure (QR/barcode) that doesn't exist yet. The count model covers the core deposit logic fully and can be migrated to per-can tracking later without breaking the pricing logic.

**Alternatives considered**: UUID per can in `user_can_inventory` — rejected because it requires delivery hardware changes outside this change's scope.

### Decision 2: Deposit calculated at order creation, not at payment

When the customer places an order, the system reads their current balance. If `balance = 0`, deposit is appended to the order total. The deposit amount is stored on the order row so it is immutable after placement.

**Why**: Avoids race conditions where balance changes between order creation and payment. The stored deposit amount is the source of truth for what the customer agreed to pay.

### Decision 3: Delivery override triggers a supplemental charge, not order edit

If a delivery person marks "empty not collected" after the customer claimed to have one, the system creates a supplemental deposit transaction rather than editing the original order total.

**Why**: Orders are financial records. Mutating a paid order total is an accounting problem. A separate charge/transaction is auditable and reversible.

### Decision 4: `is_water` flag on Product controls deposit eligibility

Only products where `is_water = true` trigger deposit logic. All other products skip deposit checks entirely.

**Why**: Clean separation. Non-water products never need deposit logic, so the flag keeps the pricing engine simple with a single guard.

### Decision 5: Can balance updated on delivery confirmation, not order placement

`cans_given` increments when the order is marked delivered (not when placed). `cans_returned` increments when delivery person confirms empty can collected.

**Why**: An order can be cancelled before delivery. Incrementing at placement would require rollback logic. Incrementing at delivery confirmation is the authoritative physical event.

## Risks / Trade-offs

- **Balance desync if delivery confirmation is skipped** → Mitigation: admin panel showing unconfirmed deliveries; auto-flag orders older than 24h without confirmation
- **Delivery person app offline during confirmation** → Mitigation: confirmation can be submitted offline and synced; system holds balance update until sync
- **Customer disputes retrospective deposit charge** → Mitigation: audit log records delivery person ID, timestamp, and override reason for every supplemental charge

## Migration Plan

1. Add `user_can_balance` table with `user_id`, `cans_given`, `cans_returned` (default 0 for all existing users)
2. Add `deposit_amount` and `deposit_required` columns to `orders` table (nullable, backfill NULL for historical orders)
3. Deploy backend changes (balance query, order pricing update, delivery confirmation endpoint)
4. Deploy frontend changes (customer order UI, delivery confirmation screen)
5. No rollback risk on data — new columns are additive; existing orders unaffected

## Open Questions

- What is the deposit amount per can size (20L vs 10L)? Assumed configurable in product table (`deposit_amount` column) rather than hardcoded.
- Does the retrospective deposit charge go through the same payment gateway as the original order, or is it collected cash-on-delivery?
