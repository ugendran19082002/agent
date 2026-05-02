## MODIFIED Requirements

### Requirement: Delivery confirmation screen with can collection toggle
The delivery app SHALL present a confirmation screen for each water product order that includes a binary toggle: "Empty can collected" / "Not collected". This is unchanged from the original spec.

#### Scenario: Delivery screen shows can collection toggle for water orders
- **WHEN** a delivery person opens a water product order for confirmation
- **THEN** the screen SHALL display a can collection toggle defaulting to "Not collected"

#### Scenario: Delivery screen omits toggle for non-water orders
- **WHEN** a delivery person opens a non-water product order for confirmation
- **THEN** the can collection toggle SHALL NOT be displayed

### Requirement: Delivery person can confirm empty can collected (per can size)
The delivery person SHALL be able to mark an empty can as collected. The system SHALL update `total_cans_returned` on the `customer_can_balance` row that matches the delivered product's `can_size`.

#### Scenario: Empty can confirmed collected — per-size counter updated
- **WHEN** a delivery person sets the toggle to "Empty can collected" and submits
- **THEN** the system SHALL increment `total_cans_returned` on the `customer_can_balance` row for the matching `can_size`
- **AND** no supplemental deposit charge SHALL be applied

### Requirement: Delivery person override when customer claimed but did not provide empty can
If a customer's order was placed assuming they had an empty can (no deposit charged at checkout) but the delivery person cannot collect one, the delivery person SHALL mark "Empty not collected", triggering a supplemental deposit charge. The deposit rate SHALL be read from System Settings for the relevant can size.

#### Scenario: Override — empty not collected, deposit was waived at order time
- **WHEN** an order has no deposit charged at checkout (customer had pending_cans > 0)
- **AND** the delivery person marks "Empty not collected"
- **THEN** the system SHALL apply a supplemental deposit charge at the platform rate for that can size (from System Settings)
- **AND** `total_cans_returned` SHALL NOT be incremented
- **AND** an audit log entry SHALL be created recording the delivery person ID, timestamp, and override action

#### Scenario: Override — empty not collected, deposit was already charged
- **WHEN** an order had a deposit charged at checkout (customer had pending_cans = 0)
- **AND** the delivery person marks "Empty not collected"
- **THEN** no additional charge SHALL be applied (deposit was already paid)
- **AND** `total_cans_returned` SHALL NOT be incremented

### Requirement: Delivery confirmation is required before order is marked complete
An order containing water products SHALL NOT be marked as fully Delivered without both: (1) the delivery person submitting can collection status, AND (2) uploading a mandatory live proof photo via camera.

#### Scenario: Order completion blocked without can collection confirmation
- **WHEN** a delivery person attempts to mark a water product order as Delivered without submitting can collection status
- **THEN** the system SHALL prevent completion and prompt for can collection confirmation

#### Scenario: Order completion blocked without live proof photo
- **WHEN** a delivery person attempts to mark any order as Delivered without uploading a live camera proof photo
- **THEN** the system SHALL log DEL0002 and block the action, requiring a live photo upload

## ADDED Requirements

### Requirement: Mandatory live proof photo for all deliveries
Every order (water or non-water) SHALL require the delivery person to upload a live photo taken via the device camera before marking the order as Delivered. Gallery uploads are not permitted for proof photos.

#### Scenario: Live proof photo required for non-water order
- **WHEN** a delivery person attempts to mark a non-water order as Delivered
- **THEN** the system SHALL also require a live proof photo upload; the requirement is not limited to water orders only

#### Scenario: Photo URL stored on order record
- **WHEN** the proof photo is uploaded and the order is marked Delivered
- **THEN** the photo's Hetzner storage URL SHALL be saved to `orders.proof_image`
