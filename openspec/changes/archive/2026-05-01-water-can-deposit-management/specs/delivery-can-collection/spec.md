## ADDED Requirements

### Requirement: Delivery confirmation screen with can collection toggle
The delivery app SHALL present a confirmation screen for each water product order that includes a binary toggle: "Empty can collected" / "Not collected".

#### Scenario: Delivery screen shows can collection toggle for water orders
- **WHEN** a delivery person opens a water product order for confirmation
- **THEN** the screen SHALL display a can collection toggle defaulting to "Not collected"

#### Scenario: Delivery screen omits toggle for non-water orders
- **WHEN** a delivery person opens a non-water product order for confirmation
- **THEN** the can collection toggle SHALL NOT be displayed

### Requirement: Delivery person can confirm empty can collected
The delivery person SHALL be able to mark an empty can as collected when the customer provides one at delivery time.

#### Scenario: Empty can confirmed collected
- **WHEN** delivery person sets the toggle to "Empty can collected" and submits
- **THEN** the system SHALL increment `cans_returned` for the customer
- **AND** no supplemental deposit charge SHALL be applied

### Requirement: Delivery person override when customer claimed but did not provide empty can
If a customer's order was placed assuming they had an empty can (deposit_required = false) but the delivery person cannot collect one, the delivery person SHALL be able to mark "Empty not collected", triggering a supplemental deposit charge.

#### Scenario: Override — empty not collected, deposit was waived at order time
- **WHEN** an order has `deposit_required = false` (deposit was waived)
- **AND** the delivery person marks "Empty not collected"
- **THEN** the system SHALL create a supplemental deposit transaction for `deposit_amount`
- **AND** `cans_returned` SHALL NOT be incremented
- **AND** an audit log entry SHALL be created recording the delivery person ID, timestamp, and override action

#### Scenario: Override — empty not collected, deposit was already charged
- **WHEN** an order has `deposit_required = true` (deposit was already charged at order time)
- **AND** the delivery person marks "Empty not collected"
- **THEN** no additional charge SHALL be applied (deposit was already paid)
- **AND** `cans_returned` SHALL NOT be incremented

### Requirement: Delivery confirmation is required before order is marked complete
An order containing water products SHALL NOT be marked as fully complete until the delivery person submits the can collection confirmation.

#### Scenario: Order completion blocked without confirmation
- **WHEN** a delivery person attempts to mark a water product order as complete without submitting can collection status
- **THEN** the system SHALL prevent completion and prompt for can collection confirmation
