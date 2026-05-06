## ADDED Requirements

### Requirement: Delivery dashboard with availability toggle
The Delivery Dashboard SHALL display the active delivery, pending pickups, completed count for today, and an availability toggle. When availability is OFF, no new orders are auto-assigned to the delivery person.

#### Scenario: Delivery person turns availability OFF during an active delivery
- **WHEN** a delivery person toggles availability OFF while an active delivery is in progress
- **THEN** the system SHALL log DEL0011 and warn the delivery person; the in-progress delivery SHALL continue to completion

#### Scenario: Delivery person turns availability ON
- **WHEN** a delivery person enables availability
- **THEN** the system SHALL make the delivery person eligible for auto-assignment of new orders

### Requirement: Delivery lifecycle status transitions
The delivery person SHALL trigger status transitions via in-app actions. The system SHALL notify the customer at each applicable state change.

#### Scenario: Delivery person marks order as Picked
- **WHEN** a delivery person taps "Mark as Picked" for an assigned order
- **THEN** the order status SHALL change to Picked; the customer SHALL be notified: "Your order has been picked up and is on the way!"

#### Scenario: Out for Delivery auto-set after Picked
- **WHEN** an order transitions to Picked
- **THEN** the system SHALL automatically set status to Out for Delivery and activate Mapbox turn-by-turn navigation for the delivery person

#### Scenario: System sets Arriving Soon at 500m
- **WHEN** the delivery person's GPS position is within 500m of the customer's delivery address
- **THEN** the system SHALL set order status to Arriving Soon and send the customer a push notification

### Requirement: Mandatory live proof photo at delivery
The delivery person SHALL upload a live photo (camera only, no gallery) showing the delivered can before marking an order as Delivered. The order SHALL NOT be marked Delivered without this photo.

#### Scenario: Delivery attempt without photo upload
- **WHEN** a delivery person attempts to mark an order as Delivered without uploading a proof photo
- **THEN** the system SHALL log DEL0002 and block the action, prompting the delivery person to take and upload a live photo

#### Scenario: Live photo uploaded and order marked Delivered
- **WHEN** a delivery person uploads a live proof photo and taps Mark as Delivered
- **THEN** the system SHALL store the photo URL on the order record (`proof_image`), set the order status to Delivered, and notify the customer

#### Scenario: Gallery upload attempted for proof photo
- **WHEN** a delivery person attempts to select a photo from the gallery instead of the camera
- **THEN** the system SHALL reject the action and require a live camera capture

### Requirement: At-delivery can collection toggle per can size
For water product orders, the delivery app SHALL display a can collection checkbox. The delivery person's action is the source of truth for empty can collection, overriding any customer claim at order time.

#### Scenario: Empty can collected by delivery person
- **WHEN** a delivery person checks "Empty can collected" for a water order
- **THEN** the system SHALL log DEL0008 and increment `total_cans_returned` for the customer's record matching the can size of the delivered product

#### Scenario: Empty can not present or not collected
- **WHEN** a delivery person leaves the can collection checkbox unchecked
- **THEN** the system SHALL log DEL0009; `total_cans_returned` SHALL NOT increment; if deposit was waived at order time, a supplemental deposit charge SHALL be applied

#### Scenario: No can collection toggle for non-water orders
- **WHEN** a delivery person opens a non-water product order
- **THEN** the can collection checkbox SHALL NOT be displayed

### Requirement: Customer no-response protocol — auto-close after 2 calls + 10-minute timer
If the customer does not respond at delivery, the delivery person SHALL log at least 2 call attempts in the app. After the 2nd call is logged, a 10-minute timer starts automatically. If no response after 10 minutes, the order is auto-closed as `failed_delivery`.

#### Scenario: Delivery person logs first call attempt
- **WHEN** a delivery person taps "Log Call" for the first time
- **THEN** the system SHALL record the call attempt; no timer is started; no penalty to the customer

#### Scenario: Delivery person logs second call attempt — timer starts
- **WHEN** a delivery person logs a second call attempt
- **THEN** the system SHALL automatically start a 10-minute countdown; no manual action is needed to start the timer

#### Scenario: 10-minute timer expires — order auto-closed
- **WHEN** the 10-minute no-response timer elapses without customer contact
- **THEN** the system SHALL log DEL0007, set order status to `failed_delivery`, auto-trigger the return flow, and send the delivery person the in-app prompt: "Order auto-closed. Return can to shop."

#### Scenario: First no-response — warning only to customer
- **WHEN** a failed_delivery event occurs for the first time for a customer
- **THEN** the system SHALL show a warning to the customer; no `cod_trust_score` change SHALL occur

#### Scenario: Repeat no-response — trust score decremented
- **WHEN** a failed_delivery event occurs for a customer who has had a prior no-response
- **THEN** the system SHALL decrement `cod_trust_score` by 1

### Requirement: Return-to-shop flow after failed delivery or cancel-after-pickup
After a `failed_delivery` or order cancellation after Picked, the delivery person SHALL receive an in-app return prompt. The shop owner must confirm receipt. If unconfirmed within 60 minutes, Admin can force-close.

#### Scenario: Delivery person initiates return to shop
- **WHEN** the delivery person taps "Return to Shop" on the return prompt
- **THEN** the system SHALL log DEL0012, set order status to `return_to_shop`, and send a push notification to the shop owner

#### Scenario: Shop owner confirms can return receipt
- **WHEN** the shop owner confirms receipt of the returned can within 60 minutes
- **THEN** the system SHALL log DEL0013, set order status to `closed`, and record `return_confirmed_at`

#### Scenario: Shop owner does not confirm within 60 minutes
- **WHEN** 60 minutes elapse without shop owner confirmation
- **THEN** the system SHALL log DEL0014, allow Admin to force-close the order, and notify all three parties (customer, shop owner, delivery person)

### Requirement: Extra charge request for floor or distance change
If delivery conditions change (floor changed, distance changed), the delivery person SHALL submit an extra charge request via the app. The charge is only applied after explicit customer approval.

#### Scenario: Customer approves extra charge request
- **WHEN** a customer approves the extra charge request within 5 minutes
- **THEN** the system SHALL log DEL0005, add the approved charge to the order total, and the delivery person proceeds

#### Scenario: Customer declines extra charge request
- **WHEN** a customer declines the extra charge request
- **THEN** the system SHALL log DEL0006; no extra charge SHALL be applied; the delivery SHALL proceed at the original order amount; no refund or partial adjustment is made

#### Scenario: Customer does not respond to extra charge request within 5 minutes
- **WHEN** 5 minutes elapse without a customer response to the extra charge request
- **THEN** the system SHALL treat it as declined (DEL0006); delivery proceeds at original amount; no extra charge is applied
