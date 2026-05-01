## 1. Database Migrations

- [x] 1.1 Add `deposit_amount` column (decimal, nullable) to `products` table for water products
- [x] 1.2 Create `user_can_balance` table with `user_id` (FK), `cans_given` (int default 0), `cans_returned` (int default 0)
- [x] 1.3 Add `deposit_required` (boolean) and `deposit_amount` (decimal) columns to `orders` table
- [x] 1.4 Seed `user_can_balance` rows for all existing users with default 0/0 values

## 2. Backend — Can Balance API

- [x] 2.1 Create `UserCanBalance` model/service with `getBalance(userId)` returning `{ cans_given, cans_returned, balance }`
- [x] 2.2 Implement `GET /api/user/can-balance` endpoint (authenticated, returns own balance)
- [x] 2.3 Write unit tests for balance computation (given - returned)

## 3. Backend — Deposit Pricing Logic

- [x] 3.1 Add deposit eligibility check in order creation service: if `product.is_water && balance === 0`, set `deposit_required = true` and copy `product.deposit_amount` onto order
- [x] 3.2 Ensure order total calculation includes deposit when `deposit_required = true`
- [x] 3.3 Write unit tests for all three pricing cases (new customer, refill with empty, refill without empty)

## 4. Backend — Delivery Confirmation & Can Balance Updates

- [x] 4.1 Create `POST /api/delivery/orders/:id/confirm-collection` endpoint accepting `{ empty_can_collected: boolean }` (delivery role only)
- [x] 4.2 On confirmed collected: increment `cans_returned` for the customer
- [x] 4.3 On delivery completed (order marked delivered): increment `cans_given` for the customer
- [x] 4.4 Override logic: if `empty_can_collected = false` and `order.deposit_required = false`, create a supplemental deposit transaction and write audit log entry (delivery person ID, timestamp, action)
- [x] 4.5 Override logic: if `empty_can_collected = false` and `order.deposit_required = true`, do nothing (deposit already charged)
- [x] 4.6 Prevent water product order from being marked complete without a collection confirmation submitted
- [x] 4.7 Write integration tests for all four delivery confirmation scenarios

## 5. Frontend — Customer Order / Checkout UI

- [x] 5.1 Fetch customer can balance from `GET /api/user/can-balance` during checkout load
- [x] 5.2 Add `DepositLineItem` component that renders "Deposit: ₹X" when `deposit_required`, hidden when not
- [x] 5.3 Wire `DepositLineItem` into `BillBreakdown` component alongside existing line items
- [x] 5.4 Display correct order total (water price + deposit when applicable) on order confirmation screen
- [x] 5.5 Write component tests for deposit shown/hidden states

## 6. Frontend — Delivery App Confirmation Screen

- [x] 6.1 Add can collection toggle ("Empty can collected" / "Not collected") to the delivery order confirmation screen, visible only for water product orders
- [x] 6.2 Default toggle to "Not collected" on screen load
- [x] 6.3 On form submit, call `POST /api/delivery/orders/:id/confirm-collection` with toggle value
- [x] 6.4 Block order completion submit button until collection confirmation is submitted for water orders
- [x] 6.5 Show confirmation message to delivery person after successful submission

## 7. Admin / Audit

- [x] 7.1 Expose supplemental deposit transactions in admin order detail view
- [x] 7.2 Add audit log display (delivery person, timestamp, override reason) on admin order detail for overridden deposits
