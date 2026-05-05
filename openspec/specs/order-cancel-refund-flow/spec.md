## ADDED Requirements

### Requirement: Cancellation before pickup always gives 100% refund
Any customer-initiated cancellation before the order reaches Picked status SHALL result in a 100% refund, regardless of the customer's UPI tier or cancellation history.

#### Scenario: Customer cancels before shop accepts
- **WHEN** a customer cancels an order before the shop has accepted it
- **THEN** the system SHALL issue a 100% refund for online orders (no COD charge); the UPI cancellation tier SHALL NOT be incremented; `pending_cans` SHALL NOT change

#### Scenario: Customer cancels after acceptance but before Picked
- **WHEN** a customer cancels an order after the shop accepted it but before the delivery person marks it Picked
- **THEN** the system SHALL issue a 100% refund; the UPI cancellation tier SHALL NOT be incremented

### Requirement: UPI tiered refund for cancellations after Picked
The tiered refund system SHALL apply ONLY to customer-initiated cancellations after the Picked state, for UPI/online orders only. The refund percentage is determined by the customer's `cancellation_count_30d` (30-day rolling window counter), read BEFORE the current cancellation is counted.

#### Scenario: First cancellation after Picked (within 30 days)
- **WHEN** a customer cancels after Picked and `cancellation_count_30d = 0` (this is their first in 30 days)
- **THEN** the system SHALL issue a 100% refund (minus deposit which is refunded separately), show Warning 1/3 as a full-screen modal, send a push notification, and increment `cancellation_count_30d`

#### Scenario: Second cancellation after Picked (within 30 days)
- **WHEN** a customer cancels after Picked and `cancellation_count_30d = 1`
- **THEN** the system SHALL issue a 60% refund (minus deposit), show Warning 2/3 modal + push, and increment `cancellation_count_30d`

#### Scenario: Third cancellation after Picked (within 30 days)
- **WHEN** a customer cancels after Picked and `cancellation_count_30d = 2`
- **THEN** the system SHALL issue a 10% refund (minus deposit), show Final Warning modal + push, and increment `cancellation_count_30d`

#### Scenario: Fourth and subsequent cancellations after Picked
- **WHEN** a customer cancels after Picked and `cancellation_count_30d >= 3`
- **THEN** the system SHALL issue 0% refund (deposit refunded separately), show no refund modal, and increment both `cancellation_count_30d` and `lifetime_cancellations`; the counter has no upper ceiling

#### Scenario: Warning dialog shown before customer confirms cancel-after-pickup
- **WHEN** a customer taps Cancel on an order that is in Picked or later status
- **THEN** the system SHALL show a warning dialog: "Cancelling now will result in a penalty. Your refund will be [X]% based on your cancellation history. Confirm?" before processing the cancellation

#### Scenario: Shop-rejected refunds do not count toward tier
- **WHEN** a shop rejects an order or an auto-reject timeout occurs
- **THEN** the customer SHALL receive a full refund; `cancellation_count_30d` SHALL NOT be incremented

#### Scenario: COD cancellation after Picked — no refund, COD counters updated
- **WHEN** a customer with a COD order cancels after Picked
- **THEN** no refund is issued (COD had no prepayment); `cod_failed_count` SHALL increment by 1; `cod_trust_score` SHALL decrement by 1

### Requirement: Deposit always refunded 100% separately on cancel-after-pickup
When an order is cancelled after the Picked state and a deposit was charged, the deposit SHALL be refunded in full, independently of the UPI tier refund applied to the rest of the order.

#### Scenario: Deposit refund on cancel-after-pickup with 0% order refund tier
- **WHEN** a customer's 4th+ cancellation triggers a 0% refund tier
- **THEN** the order total refund is 0%, BUT the deposit amount SHALL still be refunded 100% via a separate refund transaction

### Requirement: Return-to-shop status flow after cancel-after-pickup
After a customer-initiated cancel-after-pickup, the delivery person SHALL receive an in-app prompt to return the can to the shop. This initiates the return-to-shop status flow.

#### Scenario: Cancel-after-pickup triggers delivery person return prompt
- **WHEN** an order is cancelled after Picked
- **THEN** the system SHALL set order status to `cancelled_after_pickup` and send the delivery person an in-app prompt: "Order cancelled. Return the can to the shop."

#### Scenario: Delivery person returns can to shop
- **WHEN** the delivery person taps "Return to Shop"
- **THEN** the order status SHALL change to `return_to_shop` and a push notification SHALL be sent to the shop owner

#### Scenario: Shop owner confirms return
- **WHEN** the shop owner confirms receipt of the returned can
- **THEN** the order status SHALL change to `closed`; `return_confirmed_at` is recorded

#### Scenario: Return unconfirmed for 60 minutes — Admin force-close eligible
- **WHEN** 60 minutes elapse without shop owner confirmation of the return
- **THEN** the Admin SHALL be able to force-close the order; `force_closed_by_admin = true` is set; all three parties are notified

### Requirement: 30-day rolling cancellation counter maintained accurately
The `cancellation_count_30d` counter SHALL reflect the count of customer-initiated post-pickup cancellations in the last 30 calendar days. A nightly process SHALL recount from `order_status_logs`; order placement cancellation logic SHALL also count live from logs for accuracy.

#### Scenario: Nightly counter refresh
- **WHEN** the nightly cron runs
- **THEN** the system SHALL recount each customer's post-pickup cancellations from `order_status_logs` in the last 30 days and update `cancellation_count_30d`

#### Scenario: Counter used at cancel time
- **WHEN** a customer initiates a cancel-after-pickup
- **THEN** the system SHALL read the live count from `order_status_logs` in the last 30 days to determine the correct tier (not rely solely on the cached `cancellation_count_30d` value)
