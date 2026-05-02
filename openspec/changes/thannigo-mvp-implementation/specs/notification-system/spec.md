## ADDED Requirements

### Requirement: Centralized notification dispatch with channel routing
All notification events SHALL be routed through a centralized `NotificationService`. Dispatch SHALL be asynchronous via BullMQ. Each event type has a defined primary channel (push, email, or SMS) and recipients.

#### Scenario: Push notification dispatched via FCM/APNs
- **WHEN** a push notification event is triggered
- **THEN** the system SHALL enqueue a BullMQ job that sends via Firebase FCM (Android) or APNs (iOS) based on the recipient's registered device token

#### Scenario: Email dispatched via Brevo
- **WHEN** a transactional email notification event is triggered
- **THEN** the system SHALL enqueue a BullMQ job that sends via Brevo to the recipient's registered email

#### Scenario: SMS OTP via MSG91 as fallback only
- **WHEN** an OTP email via Brevo fails to confirm delivery within 30 seconds
- **THEN** the system SHALL dispatch the OTP via MSG91 SMS; MSG91 SHALL NOT be used for any non-OTP event

#### Scenario: Push notification fails
- **WHEN** a push notification delivery fails
- **THEN** the system SHALL log NOTIF0001 and not retry automatically; the business operation is not reversed

#### Scenario: Email send fails
- **WHEN** a Brevo email fails to send
- **THEN** the system SHALL log NOTIF0002 and not reverse the business operation

### Requirement: Order lifecycle notifications to correct recipients
Each order status transition SHALL trigger the correct notification to the correct recipient(s) via the correct channel.

#### Scenario: New order received — shop owner notified via push
- **WHEN** a new order is placed
- **THEN** the system SHALL send a push notification to the shop owner: "New order #[ID] received. ₹[amount]."

#### Scenario: Order accepted — customer notified via push
- **WHEN** a shop owner accepts an order
- **THEN** the system SHALL send a push notification to the customer: "Your order has been accepted by [Shop Name]."

#### Scenario: Order rejected — customer notified via push
- **WHEN** a shop owner rejects an order
- **THEN** the system SHALL send a push notification to the customer: "Your order was rejected. Choose: Switch Shop or Refund."

#### Scenario: Order picked — customer notified via push
- **WHEN** the delivery person marks an order as Picked
- **THEN** the system SHALL send a push notification to the customer: "Your order has been picked up and is on the way!"

#### Scenario: Arriving soon — customer notified via push
- **WHEN** the delivery person is within 500m of the delivery address
- **THEN** the system SHALL send a push notification to the customer: "Your delivery is arriving in ~5 minutes."

#### Scenario: Order delivered — customer notified via push and Brevo email
- **WHEN** an order is marked Delivered
- **THEN** the system SHALL send a push notification and a Brevo email to the customer: "Your order has been delivered. Rate your experience."

### Requirement: Auth and approval notifications
OTP, shop approval, and shop rejection events SHALL trigger the appropriate channel.

#### Scenario: OTP sent via Brevo email
- **WHEN** an OTP is requested
- **THEN** the system SHALL send via Brevo email: "Your OTP is [XXXXXX]. Valid for 5 minutes."

#### Scenario: Shop approved — push + email to shop owner
- **WHEN** Admin approves all 4 onboarding steps for a shop
- **THEN** the system SHALL send a push notification and Brevo email to the shop owner: "Your shop [Name] has been approved!"

#### Scenario: Shop step rejected — push + email to shop owner
- **WHEN** Admin rejects a specific onboarding step
- **THEN** the system SHALL send a push notification and Brevo email to the shop owner: "Step [X] needs correction. Reason: [remark]"

### Requirement: Payment, refund, and penalty notifications
Payment outcomes and penalty events SHALL trigger push and/or email notifications.

#### Scenario: Refund initiated — push + email to customer
- **WHEN** a refund is processed
- **THEN** the system SHALL send a push notification and Brevo email: "Refund of ₹[X] initiated. ETA 3–5 business days."

#### Scenario: UPI cancellation tier warning — push + full-screen modal
- **WHEN** a customer's UPI cancellation tier is triggered (1st, 2nd, or 3rd cancellation after Picked)
- **THEN** the system SHALL show a full-screen modal in-app and send a push notification: "Warning [X/3] used. Refund: [Y]%."

#### Scenario: COD access disabled — push to customer
- **WHEN** a customer's COD is blocked
- **THEN** the system SHALL send a push notification: "Your COD access has been disabled due to repeated failures."

#### Scenario: Extra charge request — push + in-app to customer
- **WHEN** a delivery person raises an extra charge request
- **THEN** the system SHALL send an in-app approval prompt and push notification to the customer: "Extra charge of ₹[X] due to [reason]. Approve?"

### Requirement: Water can and return-to-shop notifications
Pending can blocking events and return-to-shop flow SHALL trigger the correct notifications.

#### Scenario: Pending can block threshold reached — push to customer
- **WHEN** a customer's `pending_cans` reaches 3 for any can size
- **THEN** the system SHALL send a push notification to the customer: "Your checkout is blocked — 3 empty cans pending. Return at next delivery."

#### Scenario: Return to shop initiated — push to shop owner
- **WHEN** a delivery person taps "Return to Shop"
- **THEN** the system SHALL send a push notification to the shop owner: "[Delivery Person] is returning a can to your shop. Please confirm receipt."

#### Scenario: Admin force-closes unconfirmed return — push to all 3 parties
- **WHEN** Admin force-closes an order due to unconfirmed return
- **THEN** the system SHALL send push notifications to the customer, shop owner, and delivery person: "Order [#ID] return has been force-closed by Admin."

#### Scenario: Cancel-after-pickup — in-app prompt to delivery person
- **WHEN** an order is cancelled after Picked
- **THEN** the system SHALL show an in-app prompt to the delivery person: "Order cancelled. Return the can to the shop and confirm."

### Requirement: Loyalty, referral, and coupon notifications
Engagement events SHALL trigger push notifications to the relevant parties.

#### Scenario: Loyalty points credited — push to customer
- **WHEN** loyalty points are credited to a customer's account
- **THEN** the system SHALL send a push notification: "+[X] loyalty points added to your account."

#### Scenario: Referral points credited to both parties
- **WHEN** referral rewards are disbursed after a referred friend's first order completes
- **THEN** both the referrer and the referee SHALL receive push notifications: "+[X] loyalty points added from referral!"

#### Scenario: New coupon assigned — push to customer
- **WHEN** a coupon is assigned to a customer by admin or shop owner
- **THEN** the system SHALL send a push notification: "You have a new coupon! Code: [CODE]. Valid till [date]."

#### Scenario: Complaint resolved — push + email to complainant
- **WHEN** Admin resolves a complaint
- **THEN** the system SHALL send a push notification and Brevo email to the complainant: "Your complaint has been resolved. View details."

#### Scenario: New shop application received — push + email to Admin
- **WHEN** a shop owner completes and submits their onboarding application
- **THEN** the system SHALL send a push notification and Brevo email to the Admin: "New shop application from [Shop Name]. Review now."
