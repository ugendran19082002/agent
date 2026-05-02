## ADDED Requirements

### Requirement: Push notification on coupon assignment
When a coupon is assigned to one or more customers, each assigned customer SHALL receive a push notification informing them of the new coupon.

#### Scenario: Individual coupon notification
- **WHEN** a coupon is created with `scope = "individual"` and assigned to one customer
- **THEN** the system SHALL enqueue a push notification job for that customer with the coupon code, discount value, and expiry date

#### Scenario: Bulk coupon notifications
- **WHEN** a coupon is created with `scope = "bulk"` and assigned to multiple customers
- **THEN** the system SHALL enqueue one push notification job per assigned customer
- **AND** notifications SHALL be sent asynchronously via the job queue (not blocking the API response)

#### Scenario: Global coupon — no individual notifications
- **WHEN** a coupon is created with `scope = "global"`
- **THEN** no individual push notifications are sent (the coupon is discoverable via the discovery API)

### Requirement: Coupon notification content
Push notifications for coupon assignments SHALL include the discount description and expiry date.

#### Scenario: Notification content format
- **WHEN** a push notification is sent for a coupon assignment
- **THEN** the notification title SHALL be "New Offer for You!"
- **AND** the body SHALL include the discount (e.g., "Get 20% off" or "Save ₹50") and expiry (e.g., "Valid until 31 May")
- **AND** tapping the notification SHALL deep-link to the customer's coupons list screen

### Requirement: Notification delivery is non-blocking
Coupon assignment notifications SHALL be sent via the existing job queue and SHALL NOT block or fail the coupon creation API response if push delivery fails.

#### Scenario: Push failure does not fail coupon creation
- **WHEN** a push notification job fails or the customer has no registered push token
- **THEN** the coupon SHALL remain created and assigned
- **AND** the failure SHALL be logged but SHALL NOT surface as an error to the admin or shop owner
